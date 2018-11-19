'use strict'

function foo() {
  console.log(1);
  document.getElementById('username').innerHTML = <?= $user['username'] ?>;
  console.log(2);
}
