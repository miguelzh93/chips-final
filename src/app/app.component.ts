import { Component, DebugNode } from '@angular/core';


interface Item {
  tipo: number;
  valor: string;
  tipoLectura: any;
  verCombo: boolean;
}

const k = {
  INICIO_VAR_TEXTO: '[(',
  FIN_VAR_TEXTO: ')]',
  INICIO_VAR_CIFRA: '[[',
  FIN_VAR_CIFRA: ']]',
};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  texto: Array<Item> = [];
  textoFinal: string = '';
  position = { start: 0, end: 0 };
  textoSeleccionado: string =  '';

  ngOnInit() {
    let textoOriginal: string = 'Esta es una prueba de un texto con [[varNum1]] con otro tipo de variable [(varText1)]';
    this.mapearTexto(textoOriginal);
  }

  mapearTexto(texto: string) {
    let textoMapear = this.reemplazarCadenas(texto);
    this.texto = [];
    for (let i = 0; i < textoMapear.length; i++) {

      let letra = textoMapear.charAt(i);

      let verCombo = false;
      let tipo = 0;
      let valor = '';
      let tipoLectura = null;

      if (letra != '[') {
        //Encontro texto
        //busca si hay una variable mas adelante.  //lasas [[a]] -- [(b)]
        let posVarTexto = textoMapear.indexOf(k.INICIO_VAR_TEXTO, i);
        let posVarCifra = textoMapear.indexOf(k.INICIO_VAR_CIFRA, i);
        const hayVariable = posVarTexto > 0 || posVarCifra > 0;

        posVarTexto = posVarTexto == -1 ? textoMapear.length : posVarTexto;
        posVarCifra = posVarCifra == -1 ? textoMapear.length : posVarCifra;

        const limiteTexto = hayVariable
          ? Math.min(posVarTexto, posVarCifra)
          : textoMapear.length;

        valor = textoMapear.substring(i, limiteTexto);

        i = limiteTexto - 1;
      } else {
        //La letra es una variable
        let posVarTexto = textoMapear.indexOf(k.FIN_VAR_TEXTO, i);
        let posVarCifra = textoMapear.indexOf(k.FIN_VAR_CIFRA, i);

        posVarTexto = posVarTexto == -1 ? textoMapear.length : posVarTexto;
        posVarCifra = posVarCifra == -1 ? textoMapear.length : posVarCifra;

        const hayVariable = posVarTexto > 0 || posVarCifra > 0;
        const limiteVariable = hayVariable
          ? Math.min(posVarTexto, posVarCifra) + 2
          : textoMapear.length;

        valor = textoMapear.substring(i, limiteVariable);
        tipo = 1;
        tipoLectura =
          hayVariable && posVarTexto < posVarCifra ? 'texto' : 'cifra';

        i = limiteVariable - 1;
      }
       valor = ' ' + valor.trim() + ' ';
      let item: Item = { verCombo, tipo, valor, tipoLectura };      
      this.texto.push(item);
    }
  }

  agregarVarEnPosc(textOriginal: string, textoInsertar: string ,  posicion: number) {
    return textOriginal.slice(0, posicion) + textoInsertar + (textOriginal).slice(posicion);  
  }

  seleccionar(event: any) {
    const strEtiqueta = event.target.value;
    let caja: HTMLElement =
      document.getElementById('caja') || new HTMLElement();
    const texto1 = '' + caja.textContent;

    if (caja.firstChild) {
      let hijos = caja.childNodes;
      hijos.forEach(hijo => {
        if (hijo.nodeType != 8 && hijo.nodeName != 'P') {
          caja.removeChild(hijo);
        }
      });
    }
    debugger;
    let textoReemp = this.agregarVarEnPosc(this.textoSeleccionado, strEtiqueta, this.position.start);
    let textFinal = texto1.replace(this.textoSeleccionado , textoReemp);
    this.mapearTexto(textFinal);
  }

  gestionarCombo(posicionItem: number) {
    this.texto[posicionItem].verCombo = !this.texto[posicionItem].verCombo;
  }

  cambiarTipoLectura(posicionItem: number, nuevoTipo: string) {
    this.texto[posicionItem].tipoLectura = nuevoTipo;
    if (nuevoTipo =='texto'){
      this.texto[posicionItem].valor = this.texto[posicionItem].valor.replace(k.INICIO_VAR_CIFRA, k.INICIO_VAR_TEXTO).replace(k.FIN_VAR_CIFRA, k.FIN_VAR_TEXTO);
    } else {
      this.texto[posicionItem].valor = this.texto[posicionItem].valor.replace(k.INICIO_VAR_TEXTO, k.INICIO_VAR_CIFRA).replace(k.FIN_VAR_TEXTO, k.FIN_VAR_CIFRA);
    }
    this.gestionarCombo(posicionItem);
    let tipoTexto : string = '';
    this.texto.forEach(numero => tipoTexto = tipoTexto + numero.valor);
    this.mapearTexto(tipoTexto);
  }

  eliminarVariable(i: number) {
    this.texto.splice(i, 1);
  }
  
  reemplazarCadenas(textoVar: string): string{
    let reemplazo = textoVar.replace(new RegExp('expand_more', 'g'), '');
    reemplazo = reemplazo.replace(new RegExp('close', 'g'), '');
    reemplazo = reemplazo.replace(new RegExp('Leer como texto', 'g'), '');
    reemplazo = reemplazo.replace(new RegExp('Leer como cifra', 'g'), '');
    return reemplazo;
  }

  getTexto(){
    let caja: HTMLElement =
    document.getElementById('caja') || new HTMLElement();
    this.textoFinal = this.reemplazarCadenas('' + caja.textContent);
  }

  getPosition(el: any) {
    let selection = document.getSelection() || new Selection;
    if (selection.rangeCount) {
      let range = selection.getRangeAt(0);
      let range2 = range.cloneRange(); 
      range2.selectNodeContents(selection.anchorNode || new Node);  
      this.textoSeleccionado = range2.startContainer.textContent || '';
      this.position.start = range.startOffset;
      this.position.end = range.endOffset;
    }
    console.log(this.position.start, this.position.end)
  }
}

