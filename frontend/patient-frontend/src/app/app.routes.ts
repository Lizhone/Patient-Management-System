
import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { AddPatient } from './components/add-patient/add-patient';
import { PatientList } from './components/patient-list/patient-list';
import { UpdatePatient } from './components/update-patient/update-patient';
import { DeleteConfirmation } from './components/delete-confirmation/delete-confirmation';
import { Billing } from './components/billing/billing';
import { EditPatient } from './components/edit-patient/edit-patient';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'add-patient', component: AddPatient },

  { path: 'patients', component: PatientList },
  { path: 'patients/:id', component: UpdatePatient },

  { path: 'update-patient/:id', component: UpdatePatient },
  { path: 'delete-patient/:id', component: DeleteConfirmation },
  { path: 'billing', component: Billing },
  { path: 'edit-patient/:id', component: EditPatient },

 { path: '**', redirectTo: 'login' }
];
