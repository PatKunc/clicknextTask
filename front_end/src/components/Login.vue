<script setup>
import { onMounted, ref,onBeforeUnmount } from 'vue';
import { CheckCircleIcon,XCircleIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router';
// import { ListBulletIcon,BookmarkIcon,TrashIcon } from '@heroicons/vue/24/solid'
const username = ref('')
const password = ref('')
const status = ref('default')

const router = useRouter()
// const loginObj = ref({})



const token = async (loginData) => {
  try {
    const response = await fetch('http://localhost:5050/clicknexts/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error:', errorData);
      status.value = 'red'
    } else {
      const responseData = await response.json();
      console.log('Token:', responseData.token);
      status.value = 'green'

      localStorage.setItem('accessToken', responseData.token);
      localStorage.setItem('usernameBank', username.value)

      setTimeout(function () {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('usernameBank');
      }, 3600000);

      setTimeout(function () {
        router.push("/main");
      }, 1500);
    }
  } catch (error) {
    console.error('Error:', error);
    // Handle network or other errors
  }
};

const submit = () => {
  // if(username.value && password.value === ''){alert('Invalid Input')}
  const loginObj = {
    Username: username.value,
    Password: password.value,
  };
  status.value = 'loading'
//   console.log(loginObj);
  token(loginObj);
};

</script>
 
<template>
<div class="all">
    <div class="status" v-if="status == 'default'">
        <b>Please Login</b>
    </div>
    <div class="matchText" v-else-if="status === 'loading'">
      <b>
        Please wait ...
      </b>
    </div>
    <div class="matchTextGreen" v-else-if="status === 'green'">
      <b>Login Successful <CheckCircleIcon style="height: 25px;float: right;margin-right: 10px; color: #00d107;" /> </b>
    </div>
    <div class="matchTextRed" v-else-if="status === 'red'">
      <b>Your given username or password is incorrect<XCircleIcon style="height: 25px;float: right;margin-right: 10px; color: #ff4040;" /></b>
    </div>
    <div class="form">
        <h2>Login to Bank</h2>
            <div class="Username">
                <b>Username</b>
                <input type="text" v-model="username" @keydown.enter="submit">
            </div>
            <div class="Password">
                <b>Password</b>
                <input type="password" v-model="password" @keydown.enter="submit">
            </div>
        <button @click="submit">Login</button>
    </div>
</div>
</template>
 
<style scoped>
.all{
    display: grid;
    place-items: center;
    font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
    height: 100%;
    /* border: black 1px solid; */
}
.form{
    border: 0.5px solid gray;
    border-radius: 10px;
    width: 20%;
    padding: 20px;
    margin-top: 3%;
    /* position: fixed; */
}
b{
    margin-right: 10px;
}
button{
    border-radius: 10px;
    border: 0.5px solid gray;
    padding: 10px;
}

input{
    margin: 10px;
    border-radius: 10px;
    width: fit-content;
    height: 30px;
    padding-left: 10px;
    border: 0.5px solid gray;
}

.status,.matchText{
    border: 0.5px solid gray;
    border-radius: 10px;
    width: 20%;
    padding: 20px;
    margin-top: 5%;
}
.matchTextGreen{
    border: 2px solid #00D107;
  color: #00D107;
  background-color: #DBFFDC;
  border-radius: 8px;
  padding: 10px;
  margin-top: 5%;
}
.matchTextRed{
    border: 2px solid #ff4040;
  color: #ff4040;
  background-color: #ffbaba;
  border-radius: 8px;
  padding: 10px;
  margin-top: 5%;
}

/* .status,.matchText,.matchTextGreen,.matchTextRed{
    position: fixed;
    margin-top: 8%;
} */

button:hover {
  background-color: lightgrey;
}
</style>