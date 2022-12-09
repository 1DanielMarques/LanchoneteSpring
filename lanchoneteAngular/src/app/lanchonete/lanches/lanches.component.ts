import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Lanche } from './../model/lanche';
import { LancheService } from './../services/lanche.service';

@Component({
  selector: 'app-lanches',
  templateUrl: './lanches.component.html',
  styleUrls: ['./lanches.component.scss'],
})
export class LanchesComponent implements OnInit {

  lanches: Observable<Lanche[]>;
  
  readonly displayedColumns = ['nome', 'preco', 'descricao'];

  constructor(private service: LancheService) {
    this.lanches = this.service.findAll();
  }

  ngOnInit(): void { }
}
