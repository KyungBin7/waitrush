import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServicesService } from './modules/services/services.service';

async function seedFullData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const servicesService = app.get(ServicesService);

  try {
    // Get existing services and update them with full data
    const services = await servicesService.findAllPublic();
    
    const updates = [
      {
        slug: 'premium-app-launch',
        data: {
          tagline: 'Revolutionize your productivity workflow',
          fullDescription: `Premium App is designed for modern professionals who demand excellence from their productivity tools. Our revolutionary approach combines artificial intelligence with intuitive design to create the most advanced task management system ever built.

Key Features:
• AI-powered task prioritization that learns from your workflow
• Real-time collaboration with team members across the globe  
• Advanced analytics and productivity insights
• Seamless integration with your favorite tools
• Beautiful, intuitive interface inspired by modern design principles

Built by a team of experienced developers and designers, Premium App represents the next evolution in productivity software. We've spent over two years researching user behavior and building a system that truly understands how you work.

Early access users will receive:
• Lifetime discount on premium features
• Direct access to our development team
• Priority customer support
• Exclusive beta testing opportunities`,
          icon: 'PA',
          developer: 'Minimal Studio',
          language: 'EN',
          platform: 'Web, iOS, Android',
          launchDate: 'Q2 2024',
          screenshots: [],
          rating: 4.8
        }
      },
      {
        slug: 'beta-testing',
        data: {
          tagline: 'Shape the future of our platform',
          fullDescription: `Join our exclusive Beta Testing Program and become part of the development process. As a beta tester, you'll have direct influence on feature development and user experience design.

What you'll get:
• Early access to cutting-edge features
• Direct communication with our development team
• Monthly feedback sessions and surveys
• Exclusive beta tester community access
• Recognition in our final product credits

Requirements:
• Active engagement with testing scenarios
• Detailed feedback and bug reporting
• Participation in weekly testing cycles
• Basic technical knowledge preferred

Our beta testing program has been instrumental in creating user-centered products. Previous beta testers have helped us identify crucial improvements and innovative features that made our products industry-leading.`,
          icon: 'BT',
          developer: 'Tech Labs',
          language: 'EN, KR',
          platform: 'Web',
          launchDate: 'Ongoing',
          screenshots: [],
          rating: 4.7
        }
      },
      {
        slug: 'early-access-course',
        data: {
          tagline: 'Master advanced techniques',
          fullDescription: `Our Early Access Course represents months of curriculum development and expert instruction. This comprehensive program is designed for professionals looking to advance their skills and achieve mastery in their field.

Course Highlights:
• 12-week intensive program with live instruction
• Hands-on projects with real-world applications  
• One-on-one mentorship from industry experts
• Exclusive networking opportunities with peers
• Certification upon successful completion

What's Included:
• Weekly live sessions with Q&A
• Comprehensive video library and resources
• Private student community and forums
• Career guidance and job placement assistance
• Lifetime access to course materials and updates

Our instructors are industry veterans with decades of combined experience. The curriculum is constantly updated to reflect the latest trends and best practices in the field.

Early access participants receive special benefits including discounted pricing, priority support, and exclusive bonus content not available in the general release.`,
          icon: 'EC',
          developer: 'Learn Labs',
          language: 'EN',
          platform: 'Web',
          launchDate: 'March 2024',
          screenshots: [],
          rating: 4.9
        }
      }
    ];

    for (const update of updates) {
      const service = services.find(s => s.slug === update.slug);
      if (service) {
        console.log(`Updating service: ${update.slug}`);
        // Update directly in database using raw MongoDB operations
        const ServiceModel = servicesService['serviceModel'];
        await ServiceModel.updateOne(
          { slug: update.slug },
          { $set: update.data }
        );
      }
    }

    console.log('✅ Services updated with full data successfully!');
  } catch (error) {
    console.error('Error seeding full data:', error);
  } finally {
    await app.close();
  }
}

seedFullData();