import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent, VentanaInformacionComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialDesignModule } from './material-design/material-design.module';
import { AuthService } from './services/auth.service';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { DatabasemanagementComponent } from './databasemanagement/databasemanagement.component';
import { UsersmngComponent } from './databasemanagement/usersmng/usersmng.component';
import { VentanasConfirmacionComponent } from './databasemanagement/ventanas-confirmacion/ventanas-confirmacion.component';
import { PreguntasmngComponent } from './databasemanagement/preguntasmng/preguntasmng.component';

import { CrearpreguntaComponent } from './databasemanagement/preguntasmng/crearpregunta/crearpregunta.component';
import { TopicmngComponent } from './databasemanagement/topicmng/topicmng.component';
import { GamesmngComponent } from './databasemanagement/gamesmng/gamesmng.component';
import { GamedetailsComponent } from './databasemanagement/gamesmng/gamedetails/gamedetails.component';
import { MainComponent } from './main/main.component';
import { DialogError, SingleplayerComponent } from './games/singleplayer/singleplayer.component';
import { VentanaFinPreguntaComponent } from './games/ventana-fin-pregunta/ventana-fin-pregunta.component';
import { GameRecordDetailComponent } from './profile/game-record-detail/game-record-detail.component';
import { GameSettingsComponent } from './games/game-settings/game-settings.component';
import { ClassRoomChallengeTestComponent } from './games/classroom-challenge/class-room-challenge-test/class-room-challenge-test.component';
import { VentanaFinPreguntaCCComponent } from './games/classroom-challenge/ventana-fin-pregunta-cc/ventana-fin-pregunta-cc.component';
import { EsperarResultadosModalComponent } from './games/classroom-challenge/esperar-resultados-modal/esperar-resultados-modal.component';
import { RankingsComponent } from './rankings/rankings.component';
import { RestorePassComponent } from './restore-pass/restore-pass.component';
import { VentanaExitoComponent } from './databasemanagement/ventana-exito/ventana-exito.component';
import { InfinitemodeComponent } from './games/infinitemode/infinitemode.component';
import { LandingpageComponent } from './landingpage/landingpage.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    DatabasemanagementComponent,
    UsersmngComponent,
    VentanasConfirmacionComponent,
    CrearpreguntaComponent,
    PreguntasmngComponent,
    TopicmngComponent,
    GamesmngComponent,
    GamedetailsComponent,
    MainComponent,
    SingleplayerComponent,
    VentanaFinPreguntaComponent,
    GameRecordDetailComponent,
    GameSettingsComponent,
    ClassRoomChallengeTestComponent,
    VentanaFinPreguntaCCComponent,
    EsperarResultadosModalComponent,
    RankingsComponent,
    RestorePassComponent,
    VentanaExitoComponent,
    VentanaInformacionComponent,
    InfinitemodeComponent,
    LandingpageComponent,
    DialogError

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialDesignModule,
    ReactiveFormsModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
