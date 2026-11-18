(function(){
  var R,C,K,cells=[],W=[],turn="X",over=false,busy=false,score={X:0,O:0,D:0};
  var mode="ai",level="mid",LV={low:"Rendah",mid:"Sedang",high:"Sulit"};
  var PAGES=["home","game","group","about"];
  var $=function(id){return document.getElementById(id)};
  var SVG={
    X:'<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M24 24L76 76M76 24L24 76"/></svg>',
    O:'<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="28"/></svg>'
  };

  function seg(id,fn){
    var box=$(id);
    box.querySelectorAll("button").forEach(function(b){
      b.onclick=function(){
        box.querySelectorAll("button").forEach(function(x){x.classList.remove("on")});
        b.classList.add("on");fn(b.dataset.v);
      };
    });
  }
  seg("segMode",function(v){mode=v;$("lvlWrap").classList.toggle("hidden",v!=="ai")});
  seg("segLvl",function(v){level=v});

  document.querySelectorAll(".opt").forEach(function(b){
    b.addEventListener("click",function(){
      R=+b.dataset.r;C=+b.dataset.c;K=+b.dataset.k;
      score={X:0,O:0,D:0};
      $("lx").textContent=mode==="ai"?"Kamu (X)":"Pemain X";
      $("lo").textContent=mode==="ai"?"Komputer (O)":"Pemain O";
      $("mode").textContent=(mode==="ai"?"AI "+LV[level]:"2 Pemain")+", "+C+" × "+R;
      $("home").classList.add("hidden");$("game").classList.remove("hidden");
      makeWindows();build();
    });
  });
  document.querySelectorAll(".nl").forEach(function(b){
    b.onclick=function(){
      busy=false;over=true;
      PAGES.forEach(function(id){$(id).classList.add("hidden")});
      $(b.dataset.go).classList.remove("hidden");
      document.querySelectorAll(".nl").forEach(function(x){x.classList.toggle("on",x===b)});
      window.scrollTo(0,0);
    };
  });
  /* Hamburger menu (mobile) */
  var burger=$("burger"),menu=$("menu");
  function setMenu(open){
    menu.classList.toggle("open",open);
    burger.setAttribute("aria-expanded",open);
    burger.setAttribute("aria-label",open?"Tutup menu":"Buka menu");
  }
  burger.onclick=function(e){e.stopPropagation();setMenu(!menu.classList.contains("open"))};
  menu.querySelectorAll(".nl").forEach(function(b){b.addEventListener("click",function(){setMenu(false)})});
  document.addEventListener("click",function(e){
    if(!menu.contains(e.target)&&!burger.contains(e.target))setMenu(false);
  });
  document.addEventListener("keydown",function(e){if(e.key==="Escape")setMenu(false)});
  window.addEventListener("resize",function(){if(window.innerWidth>640)setMenu(false)});

  $("back").onclick=function(){document.querySelector('.nl[data-go="home"]').click()};
  $("again").onclick=build;
  $("reset").onclick=function(){score={X:0,O:0,D:0};build()};

  function makeWindows(){
    W=[];var dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(var r=0;r<R;r++)for(var c=0;c<C;c++)dirs.forEach(function(d){
      var er=r+d[0]*(K-1),ec=c+d[1]*(K-1);
      if(er<0||er>=R||ec<0||ec>=C)return;
      var w=[];for(var k=0;k<K;k++)w.push((r+d[0]*k)*C+c+d[1]*k);
      W.push(w);
    });
  }

  function build(){
    cells=new Array(R*C).fill("");turn="X";over=false;busy=false;
    var b=$("board");b.innerHTML="";
    b.style.gridTemplateColumns="repeat("+C+",1fr)";
    b.style.width=Math.min(540,C*(C>4?90:120))+"px";
    b.style.maxWidth="100%";
    for(var i=0;i<R*C;i++){
      var el=document.createElement("button");
      el.className="cell";el.setAttribute("aria-label","Kotak "+(i+1));
      (function(i){el.onclick=function(){
        if(busy||over||(mode==="ai"&&turn==="O"))return;
        play(i);
      }})(i);
      b.appendChild(el);
    }
    render();
  }

  function winLine(){
    for(var n=0;n<W.length;n++){
      var w=W[n],t=cells[w[0]];
      if(!t)continue;
      var ok=true;for(var k=1;k<w.length;k++)if(cells[w[k]]!==t){ok=false;break}
      if(ok)return w;
    }
    return null;
  }

  function play(i){
    if(over||cells[i])return;
    var el=$("board").children[i];
    cells[i]=turn;el.innerHTML=SVG[turn];el.classList.add(turn.toLowerCase(),"pop");el.disabled=true;
    var line=winLine();
    if(line){
      over=true;score[turn]++;
      line.forEach(function(j){$("board").children[j].classList.add("win")});
      $("status").textContent=mode==="ai"?(turn==="X"?"Kamu menang!":"Komputer menang!"):"Pemain "+turn+" menang!";
      disableAll();updateScore();return;
    }
    if(cells.every(Boolean)){
      over=true;score.D++;$("status").textContent="Seri! Tidak ada pemenang.";updateScore();return;
    }
    turn=turn==="X"?"O":"X";render();
    if(mode==="ai"&&turn==="O"){
      busy=true;
      setTimeout(function(){
        if(over&&!busy)return;
        busy=false;
        if(!over&&!cells.every(Boolean))play(aiMove());
      },450);
    }
  }

  /* ===== AI ===== */
  function empties(){var a=[];for(var i=0;i<cells.length;i++)if(!cells[i])a.push(i);return a}
  function rnd(a){return a[Math.floor(Math.random()*a.length)]}
  function dist(i){return Math.abs(Math.floor(i/C)-(R-1)/2)+Math.abs(i%C-(C-1)/2)}
  function cand(){
    var out=[],any=cells.some(Boolean);
    if(!any)return [Math.floor(R/2)*C+Math.floor(C/2)];
    if(R*C>9){
      for(var i=0;i<cells.length;i++){
        if(cells[i])continue;
        var r=Math.floor(i/C),c=i%C,ok=false;
        for(var dr=-1;dr<=1&&!ok;dr++)for(var dc=-1;dc<=1;dc++){
          var rr=r+dr,cc=c+dc;
          if(rr>=0&&rr<R&&cc>=0&&cc<C&&cells[rr*C+cc]){ok=true;break}
        }
        if(ok)out.push(i);
      }
    }
    if(!out.length)out=empties();
    return out.sort(function(a,b){return dist(a)-dist(b)});
  }
  function winningMove(p){
    var e=empties();
    for(var n=0;n<e.length;n++){
      cells[e[n]]=p;var w=winLine();cells[e[n]]="";
      if(w)return e[n];
    }
    return -1;
  }
  function heur(){
    var s=0;
    for(var n=0;n<W.length;n++){
      var x=0,o=0,w=W[n];
      for(var k=0;k<w.length;k++){var v=cells[w[k]];if(v==="X")x++;else if(v==="O")o++}
      if(x&&o)continue;
      if(o)s+=Math.pow(10,o);else if(x)s-=Math.pow(10,x)*1.1;
    }
    return s;
  }
  function mm(d,a,b,maxP){
    var w=winLine();
    if(w)return cells[w[0]]==="O"?100000+d:-100000-d;
    var c=cand();
    if(!c.length)return 0;
    if(d===0)return heur();
    var v,i;
    if(maxP){
      v=-Infinity;
      for(var n=0;n<c.length;n++){
        i=c[n];cells[i]="O";v=Math.max(v,mm(d-1,a,b,false));cells[i]="";
        a=Math.max(a,v);if(a>=b)break;
      }
    }else{
      v=Infinity;
      for(var m=0;m<c.length;m++){
        i=c[m];cells[i]="X";v=Math.min(v,mm(d-1,a,b,true));cells[i]="";
        b=Math.min(b,v);if(a>=b)break;
      }
    }
    return v;
  }
  function aiMove(){
    var e=empties();
    if(level==="low")return rnd(e);
    if(level==="mid"){
      var m=winningMove("O");if(m<0)m=winningMove("X");
      if(m>=0)return m;
      var c=cand();return c[Math.floor(Math.random()*Math.min(3,c.length))];
    }
    var depth=R*C<=9?9:4,c2=cand(),bestV=-Infinity,bm=c2[0];
    for(var n=0;n<c2.length;n++){
      cells[c2[n]]="O";
      var v=mm(depth-1,bestV,Infinity,false);
      cells[c2[n]]="";
      if(v>bestV){bestV=v;bm=c2[n]}
    }
    return bm;
  }

  function disableAll(){Array.prototype.forEach.call($("board").children,function(e){e.disabled=true})}
  function updateScore(){$("vx").textContent=score.X;$("vo").textContent=score.O;$("vd").textContent=score.D}
  function render(){
    $("status").textContent=mode==="ai"?(turn==="X"?"Giliranmu (X)":"Komputer berpikir..."):"Giliran pemain "+turn;
    $("sx").classList.toggle("on",turn==="X");$("so").classList.toggle("on",turn==="O");
    updateScore();
  }
})();