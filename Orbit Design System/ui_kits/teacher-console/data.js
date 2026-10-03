window.ORBIT_DATA={
teacher:'Ana Ortega',klass:'Period 3 · Algebra I',
students:[
{id:1,name:'Maya Kim',status:'stuck',minutes:6,topic:'Factoring quadratics',last:'Why does (x+3)(x−2) not give −6x in the middle?'},
{id:2,name:'Leo Park',status:'approval',minutes:1,topic:'Factoring quadratics',last:'Can you check my work by running it?'},
{id:3,name:'Priya Shah',status:'working',minutes:14,topic:'Factoring quadratics',last:'So I need two numbers that multiply to 12 and add to 7.'},
{id:4,name:'Sam Diaz',status:'working',minutes:9,topic:'Problem set 4.2',last:'Is the leading coefficient always 1?'},
{id:5,name:'Noah Becker',status:'stuck',minutes:11,topic:'Factoring quadratics',last:'I keep getting the signs backwards.'},
{id:6,name:'Ava Thompson',status:'working',minutes:4,topic:'Problem set 4.2',last:'Got #3. Moving to #4.'},
{id:7,name:'Jonah Reyes',status:'paused',minutes:null,topic:'Paused by you',last:''},
{id:8,name:'Zoe Laurent',status:'working',minutes:7,topic:'Factoring quadratics',last:'What does “GCF” stand for again?'},
{id:9,name:'Omar Haddad',status:'stuck',minutes:8,topic:'Problem set 4.2',last:'Just tell me the answer to #5.'},
{id:10,name:'Lily Chen',status:'working',minutes:12,topic:'Problem set 4.2',last:'Checking #6 against the example.'},
{id:11,name:'Ethan Brooks',status:'offline',minutes:null,topic:'Not signed in',last:''},
{id:12,name:'Isla Novak',status:'working',minutes:3,topic:'Factoring quadratics',last:'Can I factor out a 2 first?'}
],
transcript:[
{role:'student',time:'10:38',text:'How do I factor x² + x − 6?'},
{role:'tutor',time:'10:38',text:'Start by looking for two numbers. What should they multiply to, and what should they add to?',meta:'Hint given · answer withheld'},
{role:'student',time:'10:40',text:'Multiply to −6 and add to 1. So 3 and −2?'},
{role:'tutor',time:'10:40',text:'Good. Now write it as two binomials and expand them to check.',meta:'Scaffolding · rule “More scaffolding for Maya”'},
{role:'student',time:'10:42',text:'Why does (x+3)(x−2) not give −6x in the middle?'}
],
rules:[
{id:'r1',kind:'behavior',rule:'Give hints, but never reveal the final answer.',scope:'All students'},
{id:'r2',kind:'permission',rule:'Let students read files, but don’t let them run code.',scope:'All students'},
{id:'r3',kind:'behavior',rule:'This student needs more scaffolding.',scope:'Maya Kim'},
{id:'r4',kind:'mode',rule:'During the test, only clarify questions. Don’t solve anything.',scope:'Test mode',off:true}
],
sticking:[['Sign errors with a negative constant',6],['Choosing the factor pair',4],['Checking by expanding',2]]
};
