import React, { useState } from "react";
import "./App.css";
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram,
} from "@solana/web3.js";
// import WalletPhantom from "./wallet.tsx";

var web3 = require("@solana/web3.js");
var splToken = require("@solana/spl-token");
const phantom = require("phantom");
const bs58 = require("bs58");

var connection;
var fromWallet;
var fromAirdropSignature;
let mint;
let fromTokenAccount;
var toWallet;
var toTokenAccount;

// below code does everything on its own i.e make wallet, carry out ransaction and mint token similar to ERC20//

const ConnectWallet = async () => {
  connection = new web3.Connection(web3.clusterApiUrl("testnet"), "confirmed");
  console.log("conWallet", connection);

  fromWallet = web3.Keypair.generate();
  fromAirdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(fromAirdropSignature);

  console.log("1walletKey", fromWallet);
  console.log("1walletAddres", fromAirdropSignature);
};

const mintTokenWallet1 = async () => {
  mint = await splToken.Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9,
    splToken.TOKEN_PROGRAM_ID
  );
  fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );
  console.log("mint", mint);
};

const mintToWallet2 = async () => {
  toWallet = web3.Keypair.generate();

  toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey
  );

  await mint.mintTo(
    fromTokenAccount.address, //who it goes to
    fromWallet.publicKey, // minting authority
    [], // multisig
    1000000000 // how many
  );

  await mint.setAuthority(
    mint.publicKey,
    null,
    "MintTokens",
    fromWallet.publicKey,
    []
  );

  var transaction = new web3.Transaction().add(
    splToken.Token.createTransferInstruction(
      splToken.TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      [],
      1
    )
  );
  console.log("transaction", transaction);

  try {
    var signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWallet],
      { commitment: "confirmed" }
    );
    console.log("SIGNATURE", signature);
  } catch (e) {
    console.log(e);
  }
};

// below is new code for connecting wallet like metamask //
// connect wallet: working
// transaction: not working

const walletPhantom = async () => {
  const isPhantomInstalled = window.solana && window.solana.isPhantom;
  if (isPhantomInstalled) {
    await window.solana.connect();
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        const k = await provider.publicKey.toString();
        console.log("k", k);
      }
    }
    await window.solana.on("connect", () => console.log("connected!"));
  } else {
    const getProvider = () => {
      if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
          return provider;
        }
      }
      window.open("https://phantom.app/", "_blank");
    };
    getProvider();
  }
};

const transferPhatomMoney = async () => {
  const network = "https://api.testnet.solana.com";
  const connection = new Connection(network);
  // const transaction = new Transaction();

  var fromPubkey = "274SCbngGs74HaNca8jxR5zWwgeYiMkbf7BrdkP4ByeE";
  var toPubkey = "6dTUCnKv5ZHRbh2J8y1JyK9wmAgNqj1PzNDKgWCRnxtQ";

  const hash = await (await connection.getRecentBlockhash()).blockhash;
  console.log(hash);

  let transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromPubkey,
      toPubkey: toPubkey,
      lamports: 0.5,
    })
  );
  transaction.feePayer = fromPubkey;
  transaction.recentBlockhash = hash;
  const signedTransaction = await window.solana.request({
    method: "signTransaction",
    params: {
      message: bs58.encode(transaction.serializeMessage()),
    },
  });
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize()
  );
  console.log("trans", transaction);
  return transaction;
};

//below code is kinda useless now, not used anywhere //
const PhantomTransSign = async () => {
  const network = "https://api.testnet.solana.com";
  const connection = new Connection(network);
  const transaction = new Transaction();

  const hash = await (await connection.getRecentBlockhash()).blockhash;
  console.log(hash);
  transaction.recentBlockhash = hash;
  transaction.feePayer = "274SCbngGs74HaNca8jxR5zWwgeYiMkbf7BrdkP4ByeE";
  const signedTransaction = await window.solana.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize()
  );
};
//

function App() {
  return (
    <div className="App">
      <h1>Hello React</h1>
      <button onClick={ConnectWallet}>Connect Wallet</button>
      <button onClick={mintTokenWallet1}>mintTokenWallet1</button>
      <button onClick={mintToWallet2}>mintToWallet2</button>

      <h1>Below are for connecting wallet similar to metamask</h1>

      <button onClick={walletPhantom}>Phantom</button>
      <button onClick={transferPhatomMoney}>PhantomTransfer</button>
      <button onClick={PhantomTransSign}>newsifgn</button>
    </div>
  );
}

export default App;
