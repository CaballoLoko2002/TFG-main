import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './services/auth-guard.service';
import { ProfileComponent } from './profile/profile.component';
import { DatabasemanagementComponent } from './databasemanagement/databasemanagement.component';
import { UserResolver } from './services/user.resolver';
import { CrearpreguntaComponent } from './databasemanagement/preguntasmng/crearpregunta/crearpregunta.component';
import { PreguntasmngComponent } from './databasemanagement/preguntasmng/preguntasmng.component';
import { GamedetailsComponent } from './databasemanagement/gamesmng/gamedetails/gamedetails.component';
import { MainComponent } from './main/main.component';
import { SingleplayerComponent } from './games/singleplayer/singleplayer.component';
import { QuestionResolver } from './services/question.resolver';
import { GameRecordDetailComponent } from './profile/game-record-detail/game-record-detail.component';
import { GameSettingsComponent } from './games/game-settings/game-settings.component';
import { ClassRoomChallengeTestComponent } from './games/classroom-challenge/class-room-challenge-test/class-room-challenge-test.component';
import { AuthGuardTeacher } from './services/auth-guard-teacher.service';
import { RankingsComponent } from './rankings/rankings.component';
import { RestorePassComponent } from './restore-pass/restore-pass.component';
import { InfinitemodeComponent } from './games/infinitemode/infinitemode.component';
import { LandingpageComponent } from './landingpage/landingpage.component';

const routes: Routes = [
  {path:"home",component:MainComponent,canActivate:[AuthGuard]},
  {path:"login",component: LoginComponent},
  {path:"register",component: RegisterComponent},
  {path:"",component:LandingpageComponent},
  {path:"profile/:uuid", component: ProfileComponent,resolve: {resolvedResponse: UserResolver},canActivate:[AuthGuard]},
  {path:"databaseManagement", component: DatabasemanagementComponent,canActivate:[AuthGuard,AuthGuardTeacher]},
  {path:"databaseManagement/crearPregunta", component: CrearpreguntaComponent,canActivate:[AuthGuard,AuthGuardTeacher]},
  {path:"databaseManagement/crearGame/:gameCreation",component: PreguntasmngComponent,canActivate:[AuthGuard,AuthGuardTeacher]},
  {path:"databaseManagement/gameDetails",component: GamedetailsComponent,canActivate:[AuthGuard,AuthGuardTeacher]},
  {path:"gameRecordDetails",component:GameRecordDetailComponent,canActivate:[AuthGuard]},
  {path:"games/singleplayer", component: SingleplayerComponent,canActivate:[AuthGuard],  data: { 
    queryParams: { pais: 'pais' , categoria:'categoria'} 
  },resolve: {resolvedResponse: QuestionResolver}},
  {path:"games",component:GameSettingsComponent, data:{
    queryParams:{mode:'mode'}
  },canActivate:[AuthGuard]},
  {path:"games/classroom", component:ClassRoomChallengeTestComponent,canActivate:[AuthGuard]},
  {path:"rankings",component:RankingsComponent,canActivate:[AuthGuard]},
  {path:"restore-pass",component:RestorePassComponent},
  {path:"games/infinite",component:InfinitemodeComponent,canActivate:[AuthGuard]},
 


]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
