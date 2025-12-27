import { Routes } from '@angular/router';
import { LoginSelectionComponent } from './auth/login/login-selection/login-selection.component';
import { RegisterCompanyComponent } from './auth/register/company/register-company/register-company.component';
import { RegisterTouristComponent } from './auth/register/tourist/register-tourist/register-tourist.component';
import { CompanyPubliComponent } from './admin/company-publi/company-publi.component';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'login', component: LoginSelectionComponent},
    {path: 'register/tourist', component: RegisterTouristComponent},
    {path: 'register/company', component: RegisterCompanyComponent},
    {path: 'admin/login', component: LoginSelectionComponent},
    {path: 'admin/users-company',
        loadComponent: () => import('./admin/users-company/users-company.component')
        .then(m => m.UsersCompanyComponent),
        data: { isAdmin: true}
    },
    {path: 'admin/company-publi',
        loadComponent: () => import('./admin/company-publi/company-publi.component')
        .then(m => m.CompanyPubliComponent)
    },
    {path: 'admin/detail-company/:id',
        loadComponent: () => import('./admin/detail-company/detail-company.component')
        .then(m => m.DetailCompanyComponent)
    },
    {path: 'admin/new-company',
        loadComponent: () => import('./admin/new-company/new-company.component')
        .then(m => m.NewCompanyComponent)
    },
    {path: 'home/publi-home',
        loadComponent: () => import('./home/publi-home/publi-home.component')
        .then(m => m.PubliHomeComponent)
    },
    {path: 'oferta/:id',
        loadComponent: () => import('./home/oferta-detalle/oferta-detalle.component')
            .then(m => m.OfertaDetalleComponent)
    },
    {path: 'empresa/:id',
        loadComponent: () => import('./home/perfil-empresa/perfil-empresa.component')
            .then(m => m.PerfilEmpresaComponent)
    },
    {path: 'empresa/perfil/:id', 
        loadComponent: () => import('./empresa/perfil-empresa/perfil-empresa.component')
            .then(m => m.PerfilEmpresaComponent)
    },
    {path: 'empresa/editar-empresa/:id',
        loadComponent: () => import('./empresa/editar-empresa/editar-empresa.component')
            .then(m => m.EditarEmpresaComponent)
    },
    {path: 'crear-oferta',
        loadComponent: () => import('./empresa/nueva-oferta/nueva-oferta.component')
            .then(m => m.NuevaOfertaComponent)
    },
    {path: 'empresa/oferta/:id',
        loadComponent: () => import('./empresa/detalle-oferta/detalle-oferta.component')
            .then(m => m.DetalleOfertaComponent)
    },
    {path: 'empresa/editar-oferta/:id',
        loadComponent: () => import('./empresa/editar-oferta/editar-oferta.component')
            .then(m => m.EditarOfertaComponent)
    },
    {path: 'admin/empresa/:id',
        loadComponent: () => import('./admin/detalle-oferta-admin/detalle-oferta-admin.component')
            .then(m => m.DetalleOfertaAdminComponent)
    }
];


