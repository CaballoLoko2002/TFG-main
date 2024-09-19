import { Component  } from '@angular/core';
import { User } from './interfaces/user';
import { AuthService } from './services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  {
  user?: User|null


  constructor(private auth: AuthService,private dialog:MatDialog, private title: Title) {
    this.auth.user.subscribe(x => this.user = x);
    this.title.setTitle('CChase');
}


logout() {
    this.auth.logout();
}


openDialog() {
  const dialogRef = this.dialog.open(VentanaInformacionComponent);

}
}


@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-ayuda.html',
})
export class VentanaInformacionComponent {}

