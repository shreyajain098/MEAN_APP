import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const AuthGuard: CanActivateFn = (route, state) => {
    const authSer = inject(AuthService);
    const router = inject(Router);

    const isAuth = authSer.getAuthStatus();
    if(!isAuth) {
        router.navigate(['/auth/login']);
    }
    return true;
}