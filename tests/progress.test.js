const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=require('../engine');
const source=fs.readFileSync(require.resolve('../game.js'),'utf8');
const key='boudoir-progress-v1';

// Run the real startup and level-selection code with an inert interface.
function openGame(storage){
  const element=()=>({innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},querySelector:()=>element(),querySelectorAll:()=>[],setAttribute(){},focus(){}});
  const elements=new Map();
  const context=vm.createContext({window:{Boudoir:engine},localStorage:storage,requestAnimationFrame(){},document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},querySelector:()=>element(),addEventListener(){},body:element()}});
  vm.runInContext(source,context);
  return expression=>vm.runInContext(expression,context);
}
function storageWith(saved){let value=saved===undefined?null:JSON.stringify(saved);return{getItem:()=>value,setItem:(_,next)=>{value=next;},read:()=>JSON.parse(value)};}

test('reopening restores the last selected level and preserves records',()=>{
  const storage=storageWith({unlocked:6,currentLevel:4,best:{2:1234}});
  const run=openGame(storage);
  assert.equal(run('game.level'),4);
  run('intro(2)');
  assert.equal(storage.read().currentLevel,2);
  assert.equal(openGame(storage)('game.level'),2);
  assert.deepEqual(storage.read().best,{2:1234});
  assert.equal(storage.read().unlocked,6);
});
test('legacy saves resume the highest unlocked level',()=>{
  const storage=storageWith({unlocked:5,best:{}});
  assert.equal(openGame(storage)('game.level'),5);
  assert.equal(storage.read().currentLevel,5);
});
test('victory saves the following level, including before the next button is clicked',()=>{
  for(const level of [0,9]){
    const storage=storageWith({unlocked:level,currentLevel:level,best:{}});
    const run=openGame(storage);
    run('game.finished=true;game.served=game.config.target;game.score=1500;finish()');
    assert.equal(openGame(storage)('game.level'),Math.min(9,level+1));
    assert.equal(storage.read().best[level],1500);
  }
});
test('invalid saved levels stay within the unlocked range',()=>{
  for(const [saved,expected] of [[{unlocked:3,currentLevel:99},3],[{unlocked:3,currentLevel:-5},0],[{unlocked:3,currentLevel:'2'},3],[{unlocked:99,currentLevel:99},9]])assert.equal(openGame(storageWith(saved))('game.level'),expected);
});
test('fresh, malformed or unavailable storage still opens level one',()=>{
  for(const storage of [storageWith(),{getItem:()=>'{broken',setItem(){}},{getItem(){throw Error('Unavailable');},setItem(){throw Error('Unavailable');}}])assert.equal(openGame(storage)('game.level'),0);
});
