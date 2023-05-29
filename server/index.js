const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

function recoverPublicKeyFromSender(senderPrivateAddress) {
  return toHex(secp.secp256k1.getPublicKey(senderPrivateAddress));
}

// Demo Ethereum Private and Public Keys
// Private Key: 784d5ce5ada0072d551f9b916214a0245a920ae9014f9aa7ab4a2a48b0331a4d
// Public Key: 02fe30c2596744f0e1e029e938ffdd58b881c3a78209470a2acc9805e3a94cac2b

// Private Key: 96d015c1e89b9c5247c33566911b441e90e1d1a1eb64e33ee54e4c98385d41f8
// Public Key: 03446578c0a9064e089e5fb4bc368d947b99ee002623f4c673c099b04c810ed92f

// Private Key: b44eb97e0e4142712ac32d48d758e8fe4157e37c4cf4eda7a6c6aebb650d2fb1
// Public Key: 02ce2e5c9444f20f224150fdb353f0c6fa783010275ee79ea147088a8ada6e59bd

const balances = {
  "02fe30c2596744f0e1e029e938ffdd58b881c3a78209470a2acc9805e3a94cac2b": 100,
  "03446578c0a9064e089e5fb4bc368d947b99ee002623f4c673c099b04c810ed92f": 50,
  "02ce2e5c9444f20f224150fdb353f0c6fa783010275ee79ea147088a8ada6e59bd": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[recoverPublicKeyFromSender(address)] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;
  const verifySender = recoverPublicKeyFromSender(sender);

  setInitialBalance(verifySender);
  setInitialBalance(recipient);

  if (balances[verifySender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[verifySender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[verifySender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
