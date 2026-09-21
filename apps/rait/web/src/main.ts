// Bootstrap do console RAIT (R-0012 M1; substituído pelo Engineer do CTG-0002a conforme
// contracts/CTG-0002a.md: provideDetranAuthenticatedApp, provideRouter(RAIT_ROUTES), TitleStrategy).
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error(error);
});
