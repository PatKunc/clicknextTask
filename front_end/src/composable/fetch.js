const getBalance = async (username) => {
    try {
      const res = await fetch(
        `http://localhost:5050/clicknexts/balanceByUsername/${username}`,
        {
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );
      if (res.ok) {
        const ann = await res.json();
        return ann;
      }
    } catch (error) {
      console.log(`ERROR cannot read data: ${error}`);
    }
  };
  const getTransactionById = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5050/clicknexts/transactionById/${id}`,
        {
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );
      if (res.ok) {
        const ann = await res.json();
        return ann;
      }
    } catch (error) {
      console.log(`ERROR cannot read data: ${error}`);
    }
  };
  
  const doTransaction = async (transactionData) => {
    try {
      const response = await fetch(
        "http://localhost:5050/clicknexts/doTransaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("accessToken"),
          },
          body: JSON.stringify(transactionData),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData);
      } else {
        const responseData = await response.json();
        console.log("Transaction added successfully:", responseData);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const deposit = async (username, amount) => {
    try {
      const res = await fetch(
        `http://localhost:5050/clicknexts/deposit/${username}?amount=${amount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );
      if (res.ok) {
        const ann = await res.json();
        return ann;
      }
    } catch (error) {
      console.log(`ERROR cannot read data: ${error}`);
    }
  };
  const withdraw = async (username, amount) => {
    try {
      const res = await fetch(
        `http://localhost:5050/clicknexts/withdraw/${username}?amount=${amount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );
      if (res.ok) {
        const ann = await res.json();
        return ann;
      }
    } catch (error) {
      console.log(`ERROR cannot read data: ${error}`);
    }
  };

  export {
    getBalance,
    getTransactionById,
    doTransaction,
    deposit,
    withdraw
  }