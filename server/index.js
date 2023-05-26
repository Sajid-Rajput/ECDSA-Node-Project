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
