import {Component} from '@angular/core';
import {ToastController} from 'ionic-angular';
import {SpeechRecognition} from "@ionic-native/speech-recognition";
import * as async from "async";
import {CallNumber} from "@ionic-native/call-number";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private aids: Array<any> = [
    {words: ['policia', 'polícia', 'socorro', 'ajuda', 'tiro'], number: 190},
    {words: ['bombeiro', 'bombeiros', 'incendio', 'incêndio', 'fogo', 'queimada', 'feridos', 'ferido', 'acidente', 'acidentes'], number: 193}
  ];

  constructor(public callNumber: CallNumber, private speechRecognition: SpeechRecognition, public toastCtrl: ToastController) {
    this.requestSpeech();
  }

  private identifyAid = (matches) => {
    for (let match of matches) {
      console.log('palavra >>>> ', match);
      for(let aid of this.aids) {
        if(aid.words.indexOf(match.toLowerCase()) !== -1) {
          return this.callNumber.callNumber(aid.number, true)
            .then(() => this.toastMessage("Fazendo ligação para o serviço de emergência!"))
            .catch(() => this.toastMessage("Um erro ocorreu ao fazer a ligação para o serviço de emergência."));
        }
      }
    }

    this.toastMessage("Não foi possível reconhecer nenhum serviço de emergência.");
  }

  public requestSpeech = () => {
    let isRecognitionAvailable = (callback) => {
      this.speechRecognition.isRecognitionAvailable()
        .then((available: boolean) => {
          if (!available) {
            callback("O reconhecimento por voz não está disponível!");
          } else {
            callback(null, {});
          }
        }, err => {
          callback(err);
        })
    };

    let requestPermission = (callback) => {
      this.speechRecognition.requestPermission()
        .then(
          () => callback(null, {}),
          () => callback("Permissão para utilizar o recurso de reconhecimento por voz negado.")
        )
    }

    let startListening = (callback) => {
      this.speechRecognition.startListening()
        .subscribe(
          (matches: Array<string>) => {
            this.identifyAid(matches);

            callback(null, {})
          },
          (err) => callback(err)
        )
    }

    async.series({
      isRecognitionAvailable,
      requestPermission,
      startListening
    }, function (err, results) {
      console.log(err);
      if (err) {
        this.toastMessage(err);
      }
    });
  }

  toastMessage = (message: string) => {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).present();
  }

}
