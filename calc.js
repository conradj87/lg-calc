const debug=false

let numSims=0

let attackers = {
  num: 0,
  leader: false,
  results: []
}

let defenders = {
  num: 0,
  leader: false,
  capital: false,
  results: []
}

let simulationCounter = 0;


$(document).ready(function () {
  $( "#calculate" ).click(function() {
    //Get vars
    numSims = $("#num-sims").val()
    attackers.num = $("#attacker-num").val()
    attackers.leader = $("#attacker-leader").is(":checked")
    defenders.num = $("#defender-num").val()
    defenders.leader = $("#defender-leader").is(":checked")
    defenders.capital = $("#defender-capital").is(":checked")
    defenders.fortress = $("#defender-fortress").is(":checked")
    
    
    console.log("Initial State.")
    debugOutput(attackers, defenders)
    console.log("Starting simulation...")

    simulationCounter = 0;
    
    for( let x=0; x<numSims; x++){
      //Need to manually copy the data, as to not overwrite the originals.
      var turnAttackers={
        num: attackers.num,
        leader: attackers.leader,
        dice: 0,
        results:[]
      }

      var turnDefenders={
        num: defenders.num,
        leader: defenders.leader,
        capital: defenders.capital,
        fortress: defenders.fortress,
        dice: 0,
        results:[]
      }
      simulateTurn(turnAttackers, turnDefenders)
      simulationCounter++
    }
    processResults();
  });
});

function simulateTurn(turnAttackers, turnDefenders){
  
  //Calculate Dice count
  let playContinues = calculateDiceCount(turnAttackers, turnDefenders)

  if(!playContinues){
    // console.log("Simulation complete.")
    debugOutput(turnAttackers, turnDefenders);
    
    attackers.results[simulationCounter] = parseInt(turnAttackers.num);
    defenders.results[simulationCounter] = parseInt(turnDefenders.num);
    return;
  }

  //Roll The dice
  for(let i =0; i<turnAttackers.dice; i++){
    turnAttackers.results[i]=rollDice();
  }
  turnAttackers.results.sort((a,b)=>a-b).reverse();

  for(let i =0; i<turnDefenders.dice; i++){
    turnDefenders.results[i]=rollDice();
  }
  turnDefenders.results.sort((a,b)=>a-b).reverse();

  //Get the results
  if(turnAttackers.leader){
    turnAttackers.results[0]++;
  }

  if(turnDefenders.leader){
    turnDefenders.results[0]++;
  }

  if(turnDefenders.fortress){
    turnDefenders.results[0]++;
  }
  

  for( let i=0; i<Math.min(turnAttackers.results.length, turnDefenders.results.length); i++){
    if( turnAttackers.results[i] > turnDefenders.results[i]){
      turnDefenders.num--;
    } else {
      turnAttackers.num--;
    }
  }
  
  // console.log("Turn Completed.\n")
  debugOutput(turnAttackers, turnDefenders)
  simulateTurn(turnAttackers, turnDefenders)
}

function debugOutput(attackers, defenders){
  if(debug){
    console.log(`Attackers: ${JSON.stringify(attackers)}\n\nDefenders: ${JSON.stringify(defenders)}`)
  }
}

/**
 * Calculate how many dice each player will roll.
 * 
 * Return true if turn should continue, false if turn over.
 * @param {*} turnAttackers 
 * @param {*} turnDefenders 
 */
function calculateDiceCount(turnAttackers, turnDefenders){
  switch (true){
    case (turnAttackers.num > 3):
      turnAttackers.dice = defenders.capital ? 2 : 3
      break;
    case (turnAttackers.num == 3):
      turnAttackers.dice = 2
      break;
    case (turnAttackers.num == 2):
      turnAttackers.dice = 1
      break;
    default:
      // console.log("Turn over, not enough attackers.")
      return false;
  }

  switch (true){
    case (turnDefenders.num >= 2):
      turnDefenders.dice = 2
      break;
    case (turnDefenders.num == 1):
      turnDefenders.dice = 1
      break;
    default:
      // console.log("Turn over, not enough defenders.")
      return false;
  }
  return true;
}

function rollDice(){
  return Math.floor(Math.random() * Math.floor(6))+1;
}

function processResults(){
  let winCounter=0;
  let armiesLeft=0;
  for(let i = 0; i<numSims; i++){
    if( attackers.results[i]>1){
      winCounter++;
    }
    armiesLeft+=attackers.results[i]
  }
  let winPercentage = Math.round(winCounter/numSims*100);
  attackers.results.sort((a,b)=>a-b)
  let avg = armiesLeft/numSims
  let median = attackers.results[Math.floor(attackers.results.length/2)]
  console.log(`----- Results! -----`)
  console.log(`Win Percentage: ${winPercentage}`)
  console.log(`Average Remaining: ${avg}`)
  console.log(`Median remaining: ${median}`)

  $(".resultsOutput").html(
    "Win Percentage: " + winPercentage +
    "<br/><br/>Armies Remaining" +
    "<br/>    Average: " + avg +
    "<br/>    Median: " + median +
    "<br/>    Min: " + attackers.results[attackers.results.length-1] +
    "<br/>    Max: " + attackers.results[0]
  )
  $(".results").show()
}