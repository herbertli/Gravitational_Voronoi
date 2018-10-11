(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{113:function(e,t){},116:function(e,t,a){},189:function(e,t,a){"use strict";a.r(t);var r=a(0),n=a.n(r),l=a(79),c=a.n(l),o=a(83),s=a(11),i=a(12),m=a(14),u=a(13),p=a(15),v=a(19),y=a.n(v),h=a(9),f=a.n(h),g=a(80),b=a.n(g);a(116);var _=function(e){function t(e){var a;return Object(s.a)(this,t),(a=Object(m.a)(this,Object(u.a)(t).call(this,e))).colors=["red","blue","green","orange","yellow","purple","silver","olive","teal"],a.colorRGB=[[255,0,0],[0,0,255],[0,255,0],[255,165,0],[255,255,0],[128,0,128],[192,192,192],[128,128,0],[0,128,128]],a.canvas=n.a.createRef(),a}return Object(p.a)(t,e),Object(i.a)(t,[{key:"componentDidUpdate",value:function(){var e=this.props,t=e.bitmap,a=e.moves,r=this.canvas.current.getContext("2d");t&&""!==t&&0!==a.length&&(this.drawBoard(r,t),this.drawStones(r,a))}},{key:"drawStones",value:function(e,t){for(var a=0;a<t.length;a+=1)for(var r=0;r<t[a].length;r+=1){var n=t[a][r][0],l=t[a][r][1];e.beginPath(),e.arc(n,l,10,0,2*Math.PI,!1);var c=this.colors[a];e.fillStyle=c,e.fill(),e.lineWidth=3,e.strokeStyle="#003300",e.stroke()}}},{key:"drawBoard",value:function(e,t){for(var a=function(e){for(var t=e.split(" ").map(Number),a=[],r=0,n=0;;n+=3){for(var l=t[n];l<=t[n+1];l+=1)a.push(t[n+2]);if(999===t[n+1]&&1e3===(r+=1))break}return a}(t),r=e.getImageData(0,0,1e3,1e3),n=r.data,l=0;l<1e3;l+=1)for(var c=0;c<1e3;c+=1){var o=4*(1e3*l+c),s=parseInt(a[o/4],10);if(s>0){for(var i=this.colorRGB[s-1],m=0;m<3;m+=1)n[o+m]=i[m];n[o+3]=125}}e.putImageData(r,0,0)}},{key:"render",value:function(){return n.a.createElement("canvas",{id:"canvas",height:1e3,width:1e3,ref:this.canvas})}}]),t}(n.a.Component),E=a(37),d=a.n(E),k=a(39),O=a.n(k),j=a(3),w=a.n(j),S=a(38),x=a.n(S),B=a(18),T=a.n(B),I=a(82),G=function(e){function t(e){var a;return Object(s.a)(this,t),(a=Object(m.a)(this,Object(u.a)(t).call(this,e))).colors=["red","blue","green","orange","yellow","purple","silver","olive","teal"],a.colorRGB=[[255,0,0],[0,0,255],[0,255,0],[255,165,0],[255,255,0],[128,0,128],[192,192,192],[128,128,0],[0,128,128]],a}return Object(p.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){var e,t=this,a=this.props,r=a.classes,l=a.player_names,c=a.current_player,o=a.player_times,s=a.percentages,i=a.last_percentage;return e=l&&0!==l.length?l.map(function(e,a){return n.a.createElement(T.a,{key:e,selected:c%l.length===a},n.a.createElement(w.a,{style:{background:t.colors[a]}}),n.a.createElement(w.a,null,e),n.a.createElement(w.a,null,s[a]),n.a.createElement(w.a,null,i[a]),n.a.createElement(w.a,null,"".concat(o[a].toFixed(1),"s")))}):n.a.createElement(T.a,{key:"noPlayers"}),n.a.createElement("div",{className:r.root},n.a.createElement(f.a,{variant:"h5",gutterBottom:!0,style:{textAlign:"center"}},"Players in Lobby"),n.a.createElement(d.a,{padding:"dense",className:r.table},n.a.createElement(x.a,null,n.a.createElement(T.a,null,n.a.createElement(w.a,null,"#"),n.a.createElement(w.a,null,"Player Name"),n.a.createElement(w.a,null,"Current Score"),n.a.createElement(w.a,null,"Last Score"),n.a.createElement(w.a,null,"Time Left"))),n.a.createElement(O.a,null,e)))}}]),t}(n.a.Component),R=Object(I.withStyles)(function(e){return{root:{width:"100%",marginTop:3*e.spacing.unit,overflowX:"auto"},table:{minWidth:700}}})(G),C=function(e){var t=e.timer,a=Math.floor(t/60),r=t%60;return n.a.createElement(n.a.Fragment,null,n.a.createElement(f.a,{variant:"h5",gutterBottom:!0,style:{textAlign:"center"}},"Move Timer (estimated):"),n.a.createElement(f.a,{variant:"display1",gutterBottom:!0,style:{textAlign:"center"}},a,":",r<10?"0":"",r))},N=function(e){function t(e){var a;return Object(s.a)(this,t),(a=Object(m.a)(this,Object(u.a)(t).call(this,e))).colors=["red","blue","green","orange","yellow","purple","silver","olive","teal"],a.colorRGB=[[255,0,0],[0,0,255],[0,255,0],[255,165,0],[255,255,0],[128,0,128],[192,192,192],[128,128,0],[0,128,128]],a}return Object(p.a)(t,e),Object(i.a)(t,[{key:"render",value:function(){var e=this,t=this.props,a=t.player_names,r=t.total_scores,l=a.map(function(t,a){return n.a.createElement(T.a,{key:t},n.a.createElement(w.a,{style:{background:e.colors[a]}}),n.a.createElement(w.a,null,t),n.a.createElement(w.a,null,r[a]))});return n.a.createElement("div",null,n.a.createElement(f.a,{variant:"h5",gutterBottom:!0,style:{textAlign:"center"}},"Game Over!",n.a.createElement("br",null),"Final Scores:"),n.a.createElement(d.a,null,n.a.createElement(x.a,null,n.a.createElement(T.a,null,n.a.createElement(w.a,null,"#"),n.a.createElement(w.a,null,"Player Name"),n.a.createElement(w.a,null,"Total Score"))),n.a.createElement(O.a,null,l)))}}]),t}(n.a.Component),P=function(e){function t(e){var a;return Object(s.a)(this,t),(a=Object(m.a)(this,Object(u.a)(t).call(this,e))).clockInterval=setInterval(function(){var e=a.state.timeTaken;a.setState({timeTaken:e+1})},1e3),a.state={in_lobby:!0,game_over:!1,bitmap:"",num_players:0,current_player:-1,player_names:[],player_times:[],player_scores:[],last_percentage:[],moves:[],timeTaken:0},a}return Object(p.a)(t,e),Object(i.a)(t,[{key:"componentDidMount",value:function(){var e=this;this.socket=b()("http://localhost:10000"),this.socket.on("to_client",function(t){var a=e.state,r=a.in_lobby,n=a.moves,l=a.num_players,c=a.player_scores,s=a.percentages,i=JSON.parse(t);if(i.reset)e.resetBoard();else if(r)e.init(i.player_names);else if(i["soft-reset"])e.softReset();else if(i.game_over)e.endGame();else{var m=Object(o.a)(n);if(0===m.length)for(var u=0;u<l;u+=1)m.push([]);m[parseInt(i.current_player,10)-1].push([i.move_col,i.move_row]);var p=[],v=0;c.forEach(function(e){v+=parseInt(e,10)}),c.forEach(function(e){var t=(100*parseInt(e,10)/v).toFixed(1);p.push(t)}),e.setState({percentages:p,last_percentage:s,current_player:i.current_player,player_scores:i.player_scores,player_times:i.player_times,bitmap:i.bitmap,moves:m,timeTaken:0})}})}},{key:"resetBoard",value:function(){this.setState({in_lobby:!0,last_percentage:[],bitmap:"",moves:[],game_over:!1})}},{key:"softReset",value:function(){this.setState({moves:[],bitmap:"",game_over:!1})}},{key:"endGame",value:function(){this.setState({moves:[],bitmap:"",game_over:!0,timeTaken:0})}},{key:"init",value:function(e){for(var t=[],a=[],r=[],n=[],l=0;l<e.length;l+=1)t.push(0),a.push(120),r.push(0),n.push(0);this.setState({player_names:e,player_scores:t,player_times:a,num_players:e.length,last_percentage:r,in_lobby:!1,percentages:n,timeTaken:0})}},{key:"render",value:function(){var e=this.state,t=e.game_over,a=e.player_names,r=e.player_scores,l=e.player_times,c=e.last_percentage,o=e.current_player,s=e.percentages,i=e.timeTaken,m=e.bitmap,u=e.moves;return n.a.createElement("div",null,n.a.createElement(f.a,{variant:"h2",gutterBottom:!0,style:{textAlign:"center"}},"Gravitational Voronoi"),n.a.createElement(y.a,{container:!0,spacing:32},n.a.createElement(y.a,{item:!0,xs:2}),t?n.a.createElement(y.a,{item:!0,xs:8},n.a.createElement(N,{player_names:a,total_scores:r})):n.a.createElement(y.a,{item:!0,xs:8},n.a.createElement(R,{player_names:a,player_scores:r,player_times:l,last_percentage:c,current_player:o,percentages:s}),n.a.createElement("br",null),n.a.createElement(C,{timer:i})),n.a.createElement(y.a,{item:!0,xs:2}),n.a.createElement(y.a,{item:!0,xs:12},n.a.createElement(_,{bitmap:m,moves:u}))))}}]),t}(n.a.Component);c.a.render(n.a.createElement(P,null),document.getElementById("root"))},84:function(e,t,a){e.exports=a(189)}},[[84,2,1]]]);
//# sourceMappingURL=main.833a200f.chunk.js.map