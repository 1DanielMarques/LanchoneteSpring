import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { Lanche } from 'src/app/lanchonete/model/lanche';
import { Pedido } from 'src/app/lanchonete/model/pedido';
import { PedidoService } from 'src/app/lanchonete/services/pedido/pedido.service';

import { ErrorDialogComponent } from './../../../../../shared/components/error-dialog/error-dialog/error-dialog.component';
import { Bebida } from './../../../../model/bebida';
import { Endereco } from './../../../../model/endereco';
import { BebidaService } from './../../../../services/bebida/bebida.service';
import { LancheService } from './../../../../services/lanche/lanche.service';

@Component({
  selector: 'app-pedido-form',
  templateUrl: './pedido-form.component.html',
  styleUrls: ['./pedido-form.component.scss']
})
export class PedidoFormComponent implements OnInit {

  form = this.formBuilder.group({
    id: [''],
    tipoPagamento: ['', [Validators.required]],
    rua: ['', [Validators.required, Validators.maxLength(50)]],
    bairro: ['', [Validators.required, Validators.maxLength(50)]],
    numero: ['', [Validators.required]]

  });

  lanches$: Observable<Lanche[]> | null = null;

  bebidas$: Observable<Bebida[]> | null = null;

  endereco: Partial<Endereco> = { id: '', rua: '', bairro: '', numero: '' };
  pedido: Partial<Pedido> = {
    lanches: [],
    bebidas: [],
    tipoPagamento: '',
    endereco: this.endereco
  };

  pedido_resolver = this.route.snapshot.data['pedido'];

  show_qtd_lanche: number = 0;
  show_qtd_bebida: number = 0;

  taxa: string = '0';
  total: string = '0';
  totalAux: number = 0;
  taxaAux: number = 0;
  precoAux: number = 0;

  constructor(private formBuilder: NonNullableFormBuilder, private location: Location, private lancheService: LancheService, private bebidaService: BebidaService, private pedidoService: PedidoService, private snackBar: MatSnackBar, private dialog: MatDialog, private route: ActivatedRoute) {

    if (this.pedido_resolver.id) {
      this.taxa = this.pedido_resolver.taxa;
      this.totalAux = this.pedido_resolver.total;
      this.total = this.totalAux.toFixed(2);
      this.show_qtd_lanche = this.pedido_resolver.qtdLanches;
      this.show_qtd_bebida = this.pedido_resolver.qtdBebidas;

      this.pedido_resolver.lanches.forEach((lanche: Lanche) => {
        this.pedido.lanches?.push(lanche);
      });

      this.pedido_resolver.bebidas.forEach((bebida: Bebida) => {
        this.pedido.bebidas?.push(bebida);
      });

    } else {
      this.taxaAux = +this.taxa;
      this.taxa = this.taxaAux.toFixed(2);
      this.totalAux = +this.total;
      this.total = this.totalAux.toFixed(2);
    }

    this.onRefresh();

    console.log(this.pedido_resolver);
  }


  ngOnInit(): void {
    this.form.setValue({
      id: this.pedido_resolver.id,
      tipoPagamento: this.pedido_resolver.tipoPagamento,
      rua: this.pedido_resolver.endereco.rua,
      bairro: this.pedido_resolver.endereco.bairro,
      numero: this.pedido_resolver.endereco.numero,
    });

  }



  onPagamento(pagamento: string) {
    this.taxaAux = +this.taxa;
    this.totalAux = (+this.total) - this.taxaAux;
    this.taxa = this.pedidoService.calcTaxa(pagamento).toFixed(2);
    this.totalAux = this.totalAux + (+this.taxa);
    this.total = this.totalAux.toFixed(2);
  }

  onRefresh() {
    if (this.pedido_resolver.id) {
      this.lanches$ = this.lancheService.findLanchesPedido(this.pedido_resolver.id);
    } else {
      this.lanches$ = this.lancheService.findAll().
        pipe(
          catchError(() => {
            this.onError('Erro ao carregar Lanches.');
            return of([])
          })
        );
    }

    if (this.pedido_resolver.id) {
      this.bebidas$ = this.bebidaService.findBebidasPedido(this.pedido_resolver.id);
    } else {
      this.bebidas$ = this.bebidaService.findAll().
        pipe(
          catchError(() => {
            this.onError('Erro ao carregar Bebidas.');
            return of([])
          })
        );
    }

  }

  onError(errorMsg: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errorMsg,
    })
  }

  setData() {
    this.pedido.id = this.form.value.id;
    this.endereco.rua = this.form.value.rua;
    this.endereco.bairro = this.form.value.bairro;
    this.endereco.numero = this.form.value.numero;
    this.pedido.tipoPagamento = this.form.value.tipoPagamento;
  }

  onSubmit() {
    console.log(this.pedido);
    if (this.form.valid) {
      this.setData();
      this.pedidoService.save(this.pedido).subscribe(
        () => {
          this.onSuccessSubmit();
          // console.log(this.pedido)
        },
        () => this.onErrorSubmit());
    } else {
      this.snackBar.open('Formulário inválido', '', { duration: 5000 });
    }
  }

  onSuccessSubmit() {
    this.onCancel();
    this.snackBar.open('Pedido salvo com sucesso!', '', { duration: 5000 });
  }

  onErrorSubmit() {
    this.onCancel();
    this.snackBar.open('Erro ao salvar Pedido', '', { duration: 5000 });
  }

  onCancel() {
    this.location.back();
  }

  onAddLanche(lanche: Lanche) {
    lanche.qtd++;
    this.show_qtd_lanche++;
    console.log(this.pedido.lanches);
    this.pedido.lanches?.push(lanche);
    console.log(this.pedido.lanches);
    this.totalAux += +lanche.preco;
    this.total = this.totalAux.toFixed(2);

  }

  onRemoveLanche(lanche: Lanche) {
    if (lanche.qtd > 0) {
      lanche.qtd--;
      this.show_qtd_lanche--;
      console.log(this.pedido.lanches);
      this.pedido.lanches = this.pedido.lanches?.splice(+lanche.id, 1);
      console.log(this.pedido.lanches);
      this.totalAux -= +lanche.preco;
      this.total = this.totalAux.toFixed(2);
    } else {
      lanche.qtd = 0;
    }
  }

  onAddBebida(bebida: Bebida) {
    bebida.qtd++;
    this.show_qtd_bebida++;
    this.pedido.bebidas?.push(bebida);
    this.totalAux += +bebida.preco;
    this.total = this.totalAux.toFixed(2);

  }

  onRemoveBebida(bebida: Bebida) {
    if (bebida.qtd > 0 && this.show_qtd_bebida > 0) {
      bebida.qtd--;
      this.show_qtd_bebida--;
      this.pedido.bebidas = this.pedido.bebidas?.splice(+bebida.id, 1);
      this.totalAux -= +bebida.preco;
      this.total = this.totalAux.toFixed(2);
    } else {
      bebida.qtd = 0;
    }
  }

  getErrorMessage(formField: string) {
    const field = this.form.get(formField);
    if (field?.hasError('required')) {
      return 'Campo obrigatório.';
    }

    if (field?.hasError('maxlength')) {
      const requiredLength = field.errors ? field.errors['maxlength']['requiredLength'] : 30;
      return `Máximo de ${requiredLength} caracteres.`;
    }

    return 'Campo inválido.'
  }

  verificaDecimal(item: any) {
    let num: number = +item.preco;
    item.preco = num.toFixed(2);
    return true;
  }

}
