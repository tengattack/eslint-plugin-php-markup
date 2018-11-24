<!DOCTYPE html>
<html>
<body onload="onload()">
  <div id="username"></div>
  <script>
    function onload() {
      console.log(1);
      <?php if (!empty($user)): ?> console.log(2);
      document.getElementById('username').innerHTML = <?php echo $user['username']; ?>;
      // next line is an empty line
      <?php endif; ?>
      console.log(3);
    }
  </script>
</body>
</html>
