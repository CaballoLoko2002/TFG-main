import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardTeacher{
    constructor(
        private router: Router,
        private authenticationService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = this.authenticationService.userValue;
        if (user!.rol == "Teacher") {
            // logged in so return true
            return true;
        }


        // not logged in so redirect to login page with the return url
        this.router.navigate(['/home'], { queryParams: { returnUrl: state.url } });
        return false;
    }




}
