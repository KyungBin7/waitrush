describe('AppModule', () => {
  it('should have module structure', () => {
    // Test that the module has expected structure without instantiating it
    const fs = require('fs');
    const path = require('path');

    const modulePath = path.join(__dirname, 'app.module.ts');
    const moduleContent = fs.readFileSync(modulePath, 'utf8');

    // Check for key components
    expect(moduleContent).toContain('@Module');
    expect(moduleContent).toContain('AppController');
    expect(moduleContent).toContain('AppService');
    expect(moduleContent).toContain('HealthModule');
    expect(moduleContent).toContain('DatabaseModule');
    expect(moduleContent).toContain('ConfigModule');
    expect(moduleContent).toContain('ThrottlerModule');
    expect(moduleContent).toContain('LoggerMiddleware');
  });

  it('should implement NestModule with configure method', () => {
    const fs = require('fs');
    const path = require('path');

    const modulePath = path.join(__dirname, 'app.module.ts');
    const moduleContent = fs.readFileSync(modulePath, 'utf8');

    // Check for NestModule implementation
    expect(moduleContent).toContain('implements NestModule');
    expect(moduleContent).toContain('configure(consumer: MiddlewareConsumer)');
    expect(moduleContent).toContain('.apply(LoggerMiddleware)');
    expect(moduleContent).toContain(".forRoutes('*')");
  });

  it('should have proper configuration setup', () => {
    const fs = require('fs');
    const path = require('path');

    const modulePath = path.join(__dirname, 'app.module.ts');
    const moduleContent = fs.readFileSync(modulePath, 'utf8');

    // Check for configuration setup
    expect(moduleContent).toContain('ConfigModule.forRoot');
    expect(moduleContent).toContain('isGlobal: true');
    expect(moduleContent).toContain('validate');
    expect(moduleContent).toContain('ThrottlerModule.forRootAsync');
  });

  it('should import necessary config files', () => {
    const fs = require('fs');
    const path = require('path');

    const modulePath = path.join(__dirname, 'app.module.ts');
    const moduleContent = fs.readFileSync(modulePath, 'utf8');

    // Check for config imports
    expect(moduleContent).toContain('databaseConfig');
    expect(moduleContent).toContain('jwtConfig');
    expect(moduleContent).toContain('corsConfig');
    expect(moduleContent).toContain('throttleConfig');
    expect(moduleContent).toContain('appConfig');
  });
});
