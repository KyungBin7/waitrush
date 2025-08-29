import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { OAuthCallback } from './OAuthCallback';

// Mock dependencies
const mockNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(location.search)],
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/config/oauth', () => ({
  validateGitHubState: vi.fn(() => true),
}));

// Mock location.search
Object.defineProperty(window, 'location', {
  value: {
    search: '',
  },
  writable: true,
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('OAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset location.search
    window.location.search = '';
  });

  it('displays loading state initially', () => {
    window.location.search = '?code=test-code';
    
    render(
      <TestWrapper>
        <OAuthCallback provider="google" />
      </TestWrapper>
    );

    expect(screen.getByText('Completing Google authentication...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles OAuth error correctly', async () => {
    window.location.search = '?error=access_denied';
    
    render(
      <TestWrapper>
        <OAuthCallback provider="github" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Authentication failed',
        description: 'Access was denied. Please try again.',
        variant: 'destructive',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles missing authorization code', async () => {
    window.location.search = '';
    
    render(
      <TestWrapper>
        <OAuthCallback provider="google" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Authentication failed',
        description: 'No authorization code received.',
        variant: 'destructive',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('validates GitHub state parameter', async () => {
    window.location.search = '?code=test-code';
    
    render(
      <TestWrapper>
        <OAuthCallback provider="github" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Authentication failed',
        description: 'Missing security state. Please try again.',
        variant: 'destructive',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('calls onAuthSuccess when valid code is received', async () => {
    const mockOnAuthSuccess = vi.fn().mockResolvedValue(undefined);
    window.location.search = '?code=test-code&state=test-state';
    
    render(
      <TestWrapper>
        <OAuthCallback provider="github" onAuthSuccess={mockOnAuthSuccess} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalledWith('test-code', 'test-state');
    });
  });

  it('handles onAuthSuccess errors', async () => {
    const mockOnAuthSuccess = vi.fn().mockRejectedValue(new Error('Backend error'));
    window.location.search = '?code=test-code';
    
    render(
      <TestWrapper>
        <OAuthCallback provider="google" onAuthSuccess={mockOnAuthSuccess} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Authentication failed',
        description: 'Backend error',
        variant: 'destructive',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles different OAuth error types', async () => {
    window.location.search = '?error=server_error';
    
    render(
      <TestWrapper>
        <OAuthCallback provider="google" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Authentication failed',
        description: 'Server error occurred. Please try again later.',
        variant: 'destructive',
      });
    });
  });
});