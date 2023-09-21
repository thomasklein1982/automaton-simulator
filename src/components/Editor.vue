<template>
  <div :style="{height: '100%', display: 'flex', 'flex-direction': 'column'}">
    <EditorMenubar/>
    <Accordion>
      <AccordionTab header="Einstellungen">
        <InputText v-model="teststring" placeholder="Test-String" style="width: 100%"/>
        <InputText v-model="startingState" placeholder="Start-Zustand"/>
        <InputText v-model="startingStack" placeholder="Start-Keller"/>
        <Dropdown v-model="selectedSpeed" :options="speedOptions" optionLabel="label" class="w-full md:w-14rem" />
      </AccordionTab>
    </Accordion>
    <div :style="{display: 'flex'}">
      <span class="p-buttonset">
        <Button :disabled="runtimeError || running && position>=teststring.length" size="small" @click="run()" icon="pi pi-play"/>
        <Button :disabled="runtimeError || running && position>=teststring.length" size="small" @click="step()" icon="pi pi-step-forward"/>
        <Button :disabled="!running" size="small" @click="stop()" icon="pi pi-stop"/>
      </span>
      <span style="border: 1pt solid white; padding: 0.2rem">{{ state? state:'--' }}</span>
      <span style="font-family: monospace; overflow-wrap: anywhere" :style="{flex: 1}">
        <span>{{ teststringBefore }}</span><span style="background-color: yellow; color: black">{{ teststringCurrent }}</span><span>{{ teststringAfter }}</span> 
      </span>
      <span style="font-family: monospace; border-left: 1pt solid white">{{ stackDisplay }}</span>
    </div>
    
    <codemirror
      style="height: 100%"
      v-model="code"
      placeholder=""
      :style="{ flex: 1 }"
      :autofocus="true"
      :indent-with-tab="true"
      :tabSize="2"
      :extensions="extensions"
      @ready="log('ready', $event)"
      @change="log('change', $event)"
      @focus="log('focus', $event)"
      @blur="log('blur', $event)"
    />
    <Message severity="error" v-if="runtimeError">Zeile {{ (runtimeError.line)+": "+runtimeError.message }}</Message>
  </div>
</template>

<script>

import {Codemirror} from 'vue-codemirror';
import {oneDark} from '@codemirror/theme-one-dark';
import InputText from 'primevue/inputtext';
import 'primevue/resources/themes/lara-dark-teal/theme.css';
import EditorMenubar from './EditorMenubar.vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import PDAProgram from '../classes/PDAProgram';
import Message from 'primevue/message';
import Dropdown from 'primevue/dropdown';
import {sleep} from '../functions/helper';

export default {
  components: {
    Codemirror, InputText, EditorMenubar, Accordion, AccordionTab, Button, Chip, Message, Dropdown
  },
  data(){
    return {
      code: "",
      teststring: "",
      extensions: [oneDark],
      position: 0,
      state: "",
      startingState: "S",
      startingStack: "#",
      stack: null,
      program: null,
      running: false,
      runtimeError: null,
      selectedSpeed: 0,
      speedOptions: [
        {
          label: "Volle Geschwindigkeit",
          speed: 0
        },
        {
          label: "Schnell",
          speed: 100
        },
        {
          label: "Langsam",
          speed: 1000
        },
        {
          label: "Sehr langsam",
          speed: 2000
        },
      ]
    }
  },
  mounted(){
    let STORAGE_PREFIX="AUTOMATON_SIMULATOR";
    this.selectedSpeed=this.speedOptions[0];
    let saved=localStorage.getItem(STORAGE_PREFIX);
    if(saved){
      try{
        saved=JSON.parse(saved);
        this.teststring=saved.teststring;
        this.code=saved.code;
        this.startingStack=saved.startingStack;
        this.startingState=saved.startingState;
      }catch(e){
        console.log("couldnt restore");
      }
    }
    setInterval(()=>{
      localStorage.setItem(STORAGE_PREFIX,JSON.stringify({
        teststring: this.teststring,
        code: this.code,
        startingState: this.startingState,
        startingStack: this.startingStack
      }));
    },500);
    
  },
  computed: {
    stackDisplay(){
      if(!this.stack) return "";
      return this.stack.join("");
    },
    teststringBefore(){
      return this.teststring.substring(0,this.position);
    },
    teststringAfter(){
      return this.teststring.substring(this.position+1);
    },
    teststringCurrent(){
      return this.teststring.charAt(this.position);
    }
  },
  methods: {
    log(name,event){
      console.log(name,event);
    },
    parseProgram(){
      try{
        this.program=new PDAProgram(this.code);
      }catch(e){
        this.runtimeError=e;
      }
    },
    init(){
      //this.runtimeError=null;
      this.parseProgram();
      this.position=0;
      this.state=this.startingState;
      this.stack=[];
      if(this.startingStack){
        this.stack.push(this.startingStack);
      }
      
    },
    async run(){
      if(!this.running){
        this.running=true;
        this.init();
      }
      while(this.position>=0 && this.position<this.teststring.length){
        if(this.selectedSpeed.speed>0){
          await sleep(this.selectedSpeed.speed);
        }
        if(!this.running) return;
        if(!this.step()) break;
      }
    },
    step(){
      if(!this.running){
        this.init();
        this.running=true;
      }
      
      let top=this.stack.pop();
      let rule=this.program.getFittingRule(this.state,this.teststringCurrent,top);
      if(!rule){
        this.runtimeError={
          message: "Keine passende Regel für "+this.state+", "+this.teststringCurrent+", "+top+" gefunden.",
          line: "?"
        }
        this.stack.push(top);
        return false;
      }
      this.state=rule.newState;
      this.stack=this.stack.concat(rule.newTop);
      this.position++;
      return true;
    },
    stop(){
      this.running=false;
      this.position=0;
      this.runtimeError=null;
    }
  }
}
</script>