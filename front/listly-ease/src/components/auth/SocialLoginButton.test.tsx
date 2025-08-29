import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SocialLoginButton } from './SocialLoginButton';

describe('SocialLoginButton', () => {
  it('renders Google login button correctly', () => {
    const mockOnClick = vi.fn();
    
    render(
      <SocialLoginButton
        provider="google"
        onClick={mockOnClick}
        variant="login"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Sign in with Google');
    expect(button).not.toBeDisabled();
  });

  it('renders GitHub signup button correctly', () => {
    const mockOnClick = vi.fn();
    
    render(
      <SocialLoginButton
        provider="github"
        onClick={mockOnClick}
        variant="signup"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Sign up with GitHub');
    expect(button).not.toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    const mockOnClick = vi.fn();
    
    render(
      <SocialLoginButton
        provider="google"
        onClick={mockOnClick}
        isLoading={true}
        variant="login"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const mockOnClick = vi.fn();
    
    render(
      <SocialLoginButton
        provider="google"
        onClick={mockOnClick}
        variant="login"
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when button is disabled', () => {
    const mockOnClick = vi.fn();
    
    render(
      <SocialLoginButton
        provider="google"
        onClick={mockOnClick}
        isLoading={true}
        variant="login"
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom className correctly', () => {
    const mockOnClick = vi.fn();
    const customClass = 'custom-test-class';
    
    render(
      <SocialLoginButton
        provider="google"
        onClick={mockOnClick}
        variant="login"
        className={customClass}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });
});