export default class PDAProgram{
  constructor(code){
    this.rules=null;
    this.compile(code);
  }
  compile(code){
    this.rules=[];
    code=code.trim();
    if(code==="") return;
    let lines=code.split("\n");
    for(let i=0;i<lines.length;i++){
      let line=lines[i].trim();
      let rule=PDAProgramRule.compile(i+1,line);
      this.rules.push(rule);
    }
  }
  getFittingRule(state, character, top){
    for(let i=0;i<this.rules.length;i++){
      let r=this.rules[i];
      if(r.fits(state,character,top)){
        return r;
      }
    }
    return null;
  }
}
/*
S ( # S #(
S ( ( S ((
S ) ) S eps
*/
class PDAProgramRule{
  constructor(lineno,state, character, top, newState, newtop){
    this.state=state;
    if(character==="eps"){
      this.character=null;
    }else{
      this.character=PDAProgramRule.regExp(character);//new RegExp(character);
    }
    if(top==="eps"){
      this.top=null;
    }else{
      this.top=PDAProgramRule.regExp(top);
    }
    this.newState=newState;
    if(newtop==="eps"){
      this.newTop=[];
    }else{
      this.newTop=newtop.split("");
    }
    this.line=lineno;
    
  }
  static regExp(s){
    if(s==="("|| s===")" || s==="[" || s==="]" || s==="{" || s==="}"){
      s="\\"+s;
    }
    return new RegExp(s);
  }
  fits(state,character,top){
    if(this.state!==state) return false;
    if(this.character && !this.character.test(character)) return false;
    if(this.top && !this.top.test(top)) return false;
    return true;
  }
  static compile(line,code){
    let parts=code.split(" ");
    let realParts=[];
    for(let i=0;i<parts.length;i++){
      let p=parts[i].trim();
      if(p){
        realParts.push(p);
      }
    }
    if(realParts.length!==5){
      throw {
        message: "In jeder Zeile müssen 5 Angaben stehen: Zustand, Zeichen, Keller, neuer Zustand, neuer Keller.",
        line: line
      };
    }
    return new PDAProgramRule(line,realParts[0],realParts[1],realParts[2],realParts[3],realParts[4]);
  }
}