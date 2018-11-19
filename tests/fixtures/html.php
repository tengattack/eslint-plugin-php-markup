<!DOCTYPE html>
<html>
<body onload="onload()">
  <div id="username"></div>
  <script>
    function onload() {
      console.log(1);
      <?php if (!empty($user)): ?>
      document.getElementById('username').innerHTML = <?= $user['username'] ?>;
      <?php endif; ?>
      console.log(2);
    }
  </script>
</body>
</html>
