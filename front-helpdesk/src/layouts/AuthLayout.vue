<template>
  <div class="container-xxl">
    <div class="authentication-wrapper authentication-basic container-p-y">
      <div class="authentication-inner">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.authentication-wrapper {
  display: flex;
  flex-basis: 100%;
  min-height: 100vh;
  width: 100%;
}

.authentication-inner {
  max-width: 450px;
  position: relative;
  margin: auto;
}
</style>