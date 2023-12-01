<script setup>
import { useRouter } from "vue-router";
import { DeviceTabletIcon, UserIcon } from "@heroicons/vue/24/solid";
import { ref, onMounted } from "vue";
import { jwtDecode } from "jwt-decode";
import { getBalance, getTransactionById, doTransaction, deposit, withdraw } from "../composable/fetch"

const router = useRouter();
const usernameLocal = ref("");
const tranAmount = ref();
const decoded = ref("");
const history = ref([]);
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// const sortHis = ref([])
const transferId = ref();
let info = ref();
let balance = ref();
let currentComponent = ref("deposit");
const canTran = ref(true);

const changeTime = (date) => {
  const time = new Date(date);
  if (time.getFullYear() > 1970)
    return time.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  else return "-";
};

const changeComponent = (com) => {
  currentComponent.value = com;
};

const trannsfer = async (transactionData) => {
  try {
    const res = await fetch(`http://localhost:5050/clicknexts/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("accessToken"),
      },
      body: JSON.stringify(transactionData),
    });
    if (res.ok) {
      const ann = await res.json();
      return ann;
    }
    if (res.status !== 200) {
      canTran.value = false;
    }
  } catch (error) {
    console.log(`ERROR cannot read data: ${error}`);
  }
};

const submitDeposit = async () => {
  deposit(usernameLocal.value, tranAmount.value);
  if (
    typeof tranAmount.value === "number" &&
    !isNaN(tranAmount.value) &&
    tranAmount.value > 0
  ) {
    balance.value = parseInt(balance.value) + parseInt(tranAmount.value);
    const transaction = {
      UserID: decoded.value.UserID,
      // UserID:[3,4],
      type: "deposit",
      timestamp: new Date().toISOString(),
      amount: tranAmount.value,
      remain: balance.value,
    };
    doTransaction(transaction);
    history.value.unshift(transaction);
  } else {
    alert("Invalid Input");
  }
  tranAmount.value = "";
};
const submitWithdraw = async () => {
  withdraw(usernameLocal.value, tranAmount.value);
  if (
    typeof tranAmount.value === "number" &&
    !isNaN(tranAmount.value) &&
    tranAmount.value > 0 &&
    balance.value > tranAmount.value
  ) {
    balance.value = parseInt(balance.value) - parseInt(tranAmount.value);
    const transaction = {
      UserID: decoded.value.UserID,
      type: "withdraw",
      timestamp: new Date().toISOString(),
      amount: tranAmount.value,
      remain: balance.value,
    };
    doTransaction(transaction);
    history.value.unshift(transaction);
  } else {
    alert("Invalid Input or Insufficient balance for withdraw");
  }
  tranAmount.value = "";
};
const submitTransfer = async () => {
  if (
    typeof tranAmount.value === "number" &&
    !isNaN(tranAmount.value) &&
    tranAmount.value > 0 &&
    transferId.value !== decoded.value.UserID
  ) {
    // balance.value = parseInt(balance.value)-parseInt(tranAmount.value)
    const transaction = {
      UserID: [decoded.value.UserID, transferId.value],
      transferorId: decoded.value.UserID,
      receiverId: transferId.value,
      type: "transfer",
      timestamp: new Date().toISOString(),
      amount: tranAmount.value,
      remain: balance.value - tranAmount.value,
    };
    await trannsfer(transaction);
    if (canTran.value === true) {
      history.value.unshift(transaction);
      balance.value = parseInt(balance.value) - parseInt(tranAmount.value);
    }
  } else if (decoded.value.UserID === transferId.value) {
    alert("You can not transfer to your own ID, use deposit menu");
  } else {
    alert(
      "Invalid input or You can not transfer to your own ID, use deposit menu"
    );
  }
  tranAmount.value = "";
};

const logout = () => {
  router.push("/login");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("usernameBank");
};

const calculateDepositTotalAmount = (history) => {
  const depositTransactions = history.filter(
    (transaction) =>
      transaction.type === "deposit" ||
      ("transfer" && transaction.receiverId === decoded.value.UserID)
  );

  const depositTotalAmount = depositTransactions.reduce(
    (total, transaction) => {
      // Ensure that transaction.amount is a number before adding it to the total
      const amount = parseFloat(transaction.amount);
      return !isNaN(amount) ? total + amount : total;
    },
    0
  );
  //   console.log('Deposit Total Amount:', depositTotalAmount);
  return depositTotalAmount;
};
const calculateWithdrawTotalAmount = (history) => {
  const withdrawTransaction = history.filter(
    (transaction) =>
      transaction.type === "withdraw" ||
      ("transfer" && transaction.transferorId === decoded.value.UserID)
  );

  const withdrawTotalAmount = withdrawTransaction.reduce(
    (total, transaction) => {
      const amount = parseFloat(transaction.amount);
      return !isNaN(amount) ? total + amount : total;
    },
    0
  );

  //   console.log('Deposit Total Amount:', depositTotalAmount);
  return withdrawTotalAmount;
};

onMounted(async () => {
  usernameLocal.value = localStorage.getItem("usernameBank");

  info.value = await getBalance(usernameLocal.value);
  balance.value = parseInt(info.value.balance);
  decoded.value = jwtDecode(localStorage.getItem("accessToken"));
  history.value = await getTransactionById(decoded.value.UserID);
  // sortHis.value = history.value.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp))
  // console.log(sortHis.value)
  history.value.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp))
  setTimeout(function () {
    alert('Session expired, please login again')
        router.push('/login')
      }, 3600000);
});
</script>

<template>
  <div class="all">
    <nav>
      <UserIcon style="height: 18px" />
      <p>{{ usernameLocal }}|</p>
      <button class="navbut" @click="changeComponent('deposit')">
        Deposit
      </button>
      <button class="navbut" @click="changeComponent('transfer')">
        Transfer
      </button>
      <button class="navbut" @click="changeComponent('withdraw')">
        Withdraw
      </button>
      <button class="navbut" @click="changeComponent('history')">
        History
      </button>
      <button class="logout" style="float: right" @click="logout">
        Logout
      </button>
    </nav>

    <h4 class="timeZone">Date/Time shown in Timezone: {{ timeZone }}</h4>
    <div class="content">
      <div style="background-color: #333;margin-top: 20px;margin-bottom: 20px;padding: 10px;border-radius: 10px;color: aliceblue;">
      <h2>Balance: <span style="padding: 5px;background-color: aliceblue;border-radius: 10px;color: #333;">{{ balance }} baht</span></h2>
      </div>
    <div v-if="currentComponent === 'deposit'" class="deposit">
      <div class="d-form">
        <h2>Deposit</h2>
        <b style="margin-left: 15px">Amount</b>
        <input v-model="tranAmount" type="number" placeholder="Baht ฿" />
        <button style="margin-left: 20px" @click="submitDeposit">
          Deposit
        </button>
      </div>
    </div>
    <div v-if="currentComponent === 'transfer'" class="transfer">
      <div class="t-form">
        <h2>Transfer</h2>
        <b>To (userID)</b>
        <input
          v-model="transferId"
          type="number"
          placeholder="Ex.1 or 2"
          style="margin-bottom: 10px"
        /><br />
        <b>Amount</b>
        <input v-model="tranAmount" type="number" placeholder="Baht ฿" />
        <button style="margin-left: 20px" @click="submitTransfer">
          Transfer
        </button>
      </div>
    </div>
    <div v-if="currentComponent === 'withdraw'" class="withdraw">
      <div class="w-form">
        <h2>Withdraw</h2>
        <b style="margin-left: 15px">Amount</b>
        <input v-model="tranAmount" type="number" placeholder="Baht ฿" />
        <button style="margin-left: 20px" @click="submitWithdraw">
          Withdraw
        </button>
      </div>
    </div>
    <div v-if="currentComponent === 'history'" class="history">
      <div class="h-form">
        <!-- <div style="display: inline-block;width:100%;"><h2>Transactions</h2><h2 style="float: right;">Total:{{ history.length }}</h2></div>
         -->
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          "
        >
          <h2 style="flex: 1">Transactions</h2>
          <h2>Total Transactions: {{ history.length }}</h2>
        </div>
        <b v-if="history.length <= 0" style="color: gray"
          >No transaction yet.</b
        >
        <div v-for="(his, index) in history" :key="index" class="listHis">
          <p class="historyVfor">
            <span>Date:</span> {{ changeTime(his.timestamp) }}
          </p>
          <br />
          <p class="historyVfor"><span>Amount:</span> {{ his.amount }} ฿</p>
          <br />
          <p
            class="historyVfor"
            v-if="
              his.transferorId === decoded.UserID ||
              his.transferorId === undefined
            "
          >
            <span>Remain:</span> {{ his.remain }} ฿
          </p>
          <br
            v-if="
              his.transferorId === decoded.UserID ||
              his.transferorId === undefined
            "
          />
          <p class="historyVfor"><span>Type:</span> {{ his.type }}</p>
          <br />
          <p
            class="historyVfor"
            v-if="his.type === 'transfer' && his.receiverId === decoded.UserID"
          >
            <span>Status:</span> Receiver
          </p>
          <p
            class="historyVfor"
            v-if="his.type === 'transfer' && his.transferorId === decoded.UserID"
          >
            <span>Status:</span> Transferor
          </p><br v-if="his.type === 'transfer' && his.transferorId === decoded.UserID">
          <p class="historyVfor"
          v-if="his.transferorId === decoded.UserID&&his.type === 'transfer'"
          >
          <span>Transfer to UserID:</span> {{ his.receiverId }}
        </p><br v-if="his.type === 'transfer' && his.receiverId === decoded.UserID">
        <p class="historyVfor"
          v-if="his.type === 'transfer' && his.receiverId === decoded.UserID"
          >
          <span>Receive from UserID: </span> {{ his.transferorId }}
        </p>
          <!-- <p class="historyVfor"><span>Tranfer from:</span> {{ `${receiver(his.tansferorId)}.value` }}</p><br> -->
        </div>
        <b style="float: right"
          >Total Income: {{ calculateDepositTotalAmount(history) }} ฿ || Total
          Outcome: {{ calculateWithdrawTotalAmount(history) }} ฿</b
        >
      </div>
    </div>
    </div>
  </div>
</template>
2

<style scoped>
.all {
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
}

nav {
  background-color: #333;
  color: #fff;
  padding: 10px;
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
  /* text-align: center; */
}

p {
  color: #fff;
  text-decoration: none;
  margin: 0 15px;
  font-size: 18px;
  display: inline-block;
}

button:hover {
  background-color: #808080;
  border-radius: 10px;
  padding: 5px;
  color: white;
}
button {
  transition: 0.3s;
  border: 0px;
  border-radius: 10px;
  padding: 5px;
  font-size: 14px;
}
.logout {
  border: 0px;
  background-color: #333;
  color: white;
}
.navbut {
  background-color: #333;
  border: 0px;
  color: white;
}

input {
  padding: 10px;
  border-radius: 10px;
  margin-left: 5px;
}
.transfer,
.deposit,
.withdraw,
.history {
  border: 0.5px solid gray;
  border-radius: 10px;
  padding: 30px;
  width: 50%;
  background-color: #333;
  color: aliceblue;
}
.historyVfor {
  color: black;
}
.listHis {
  border: 0.5px solid gray;
  padding: 10px;
  margin: 5px;
  color: black;
  border-radius: 10px;
  background-color: aliceblue;
}

span {
  font-weight: bold;
  color: #333;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 10%; /* Optionally, set the height to 100% of the viewport height for full-page centering */
}
</style>
