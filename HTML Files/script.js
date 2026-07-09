
async function updateProfile(){

  let email = localStorage.getItem("email");

  let data = {
    email,
    region: document.getElementById("region").value,
    illness: document.getElementById("illness").value,
    diet: document.getElementById("diet").value,
    activity: document.getElementById("activity").value
  };

  const response = await fetch("http://localhost:3000/updateProfile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if(result.success){
    localStorage.setItem("profileUpdated", true);
    redirectUser();
  }
}


function calculateProgress(){

let total = 0;
let max = 14;

// example scoring logic
let sugar = document.getElementById("sugarSlider").value;
total += (2 - sugar);

let exercise = document.querySelector('input[name="q5"]:checked');
if(exercise) total += parseInt(exercise.value);

let percent = Math.round((total/max)*100);

// save to backend
fetch("http://localhost:3000/saveProgress", {
  method: "POST",
  headers: {"Content-Type":"application/json"},
  body: JSON.stringify({
    email: localStorage.getItem("email"),
    score: percent
  })
});
}




