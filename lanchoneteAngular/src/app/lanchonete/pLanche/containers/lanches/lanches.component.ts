import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { ErrorDialogComponent } from 'src/app/shared/components/error-dialog/error-dialog.component';

import { Lanche } from '../../../model/lanche';
import { LancheService } from '../../../services/lanche/lanche.service';


@Component({
  selector: 'app-lanches',
  templateUrl: './lanches.component.html',
  styleUrls: ['./lanches.component.scss'],
})
export class LanchesComponent implements OnInit {

  lanches$: Observable<Lanche[]> | null = null;

  constructor(
    private service: LancheService,
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,) {
    this.refresh();
  }

  refresh() {
    this.lanches$ = this.service.findAll().
      pipe(
        catchError(error => {
          this.onError('Erro ao carregar Lanches.');
          return of([])
        })
      );
  }

  onError(errorMsg: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errorMsg,
    });
  }

  ngOnInit(): void { }


  onHome() {
    this.router.navigate(['lanchonete']);
  }

  onAdd() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  onEdit(lanche: Lanche) {
    this.router.navigate(['edit', lanche.id], { relativeTo: this.route });
  }

  onDelete(lanche: Lanche) {
    this.service.remove(lanche.id).subscribe(
      () => {
        this.refresh();
        return this.snackBar.open('Lanche removido com sucesso!', '', { duration: 5000, verticalPosition: 'top', horizontalPosition: 'center' });
      },
      () => this.onError('Erro ao tentar remover Lanche')

    );
  }

}
