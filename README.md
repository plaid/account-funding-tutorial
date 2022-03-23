## Building account funding in the Plaid Pattern sample app

### Table of Contents

* [Overview](#overview)
* [Your Task](#your-task)
* [Setting Up](#setting-up)
* Building account funding
  * [Checkpoint 1: Implementing Link and initializing with Auth and Identity](#checkpoint-1-initializing-link-with-auth-and-identity)
  * [Checkpoint 2: Retrieve identity and initial balance information associated with the account](#checkpoint-2-retrieve-identity-and-initial-balance-information-associated-with-the-account)
  * [Checkpoint 3: Generating a partner processor token (Dwolla)](#checkpoint-3-generating-a-partner-processor-token)
  * [Checkpoint 4: Parsing user name and email](#checkpoint-4-parsing-user-name-and-email)
  * [Checkpoint 5: Checking real-time account balance](#checkpoint-5-checking-current-account-balance)
  * [Checkpoint 6: Retrieving real-time account balance](#checkpoint-6-retrieving-real-time-balance-information)
  * [Checkpoint 7: Verifying user identity](#checkpoint-7-verifying-user-identity)
  * [Checkpoint 8: Initiating a transfer](#checkpoint-8-initiating-a-transfer)
  * [Checkpoint 9: Sending the transfer request to Dwolla](#checkpoint-9-sending-the-transfer-request-to-dwolla)
* [Let's try it all out!](#lets-try-it-all-out)
* [Next steps](#next-steps)

### Overview

Transferring funds from a bank account into an app (i.e., "account funding") is a common use case when building with Plaid. In this tutorial, we'll demonstrate how to implement account funding in the Plaid Pattern sample app.

Account funding is commonly implemented using a combination of Plaid products and a Plaid partner (i.e., Stripe, Dwolla, etc.). In this tutorial, we'll use Plaid Auth, Balance, Identity ("ABI"), and Dwolla to build account funding into the Pattern sample app. We'll retrieve account information through a combination of Auth and Dwolla, use Balance to check the balance of an account, and use Identity to verify the identity of users initiating a transfer. Dwolla will be used to move (fictional) funds from a user's bank account into the Plaid Pattern sample app. For a full list of supported partners, see [Auth Payment Partners](https://plaid.com/docs/auth/partnerships/).

For a preview of what you'll be building toward, navigate to the <a href="https://github.com/plaid/pattern-account-funding" target="_blank">Plaid Pattern sample app</a> and follow the instructions in the README to launch the app. Once the app is up and running, create a user, enable "Verify Identity Mode", and proceed to link a bank account. Finally, click the "Transfer funds" button to transfer funds into the Pattern app.

### Your Task

In this tutorial, you'll start with a "skeleton" version of the codebase for the Plaid Pattern sample app. Everything except the account funding functionality will exist in the skeleton codebase. You'll build account funding as you progress through the tutorial. We'll provide the code snippets needed to build this functionality, as well as an explanation of what each code snippet does.

Finally, if you've progressed through the tutorial and would like to leave feedback, see [Feedback: Account Funding Tutorial](https://github.com/plaid/account-funding-tutorial/issues/7). We'll be sure to take a look and do our best to help.

### Setting Up

There are a few things you'll need to do first to make sure you can successfully complete the tutorial.

#### Install and run Docker 

To run Plaid Pattern, you'll need Docker. If you don't already have Docker installed, refer to [Docker's documentation to get started](https://docs.docker.com/get-started/). Once Docker is installed, start Docker.

#### Clone this repo to your machine

```
git clone https://github.com/plaid/account-funding-tutorial.git && cd account-funding-tutorial/
```

Inside of **pattern-af-tutorial/**, you'll find the skeleton codebase for this tutorial. This is where you'll build account funding.

#### Install the client dependencies

```
cd pattern-af-tutorial/ && cd client/ && npm install
```

#### Enable the Plaid API

First, create a **.env** file in the **pattern-af-tutorial/** directory. Copy the contents of the **.env.template** file into **.env**. 

Next, navigate to the <a href="https://dashboard.plaid.com/team/keys" target="_blank">Keys section of your Plaid Dashboard</a>. Set the following variables in your **.env** file using the client ID and secrets in your Dashboard:

```bash
PLAID_CLIENT_ID=
PLAID_SECRET_SANDBOX=
```

When setting `PLAID_SECRET_SANDBOX`, use the value of the "Sandbox" secret in your Plaid Dashboard. Don't use quotes (`"`) around any of the values (i.e., `PLAID_CLIENT_ID=adn08a280hqdaj0ad`, not `PLAID_CLIENT_ID="adn08a280hqdaj0ad"`).

#### Enable Dwolla

Navigate to the <a href="https://dashboard.plaid.com/team/integrations" target="_blank">Integrations section of your Plaid Dashboard</a> and enable Dwolla. This will ensure we can use Dwolla as a partner for the funds transfer. The app won't function properly if this integration isn't enabled.

To use the Dwolla API, <a href="https://accounts-sandbox.dwolla.com/sign-up" target="_blank">create a sandbox account with Dwolla</a>.

After creating an account, we'll need to equip the skeleton codebase with the proper Dwolla API credentials. This will ensure we can actually make funds transfers using Dwolla. 

In your **.env** file, set the following variables:

```bash
IS_PROCESSOR=true
DWOLLA_ACCESS_TOKEN=
DWOLLA_MASTER_ACCOUNT_ID=
```

`IS_PROCESSOR=true` will enable the app to use Dwolla for money movement.

To set `DWOLLA_ACCESS_TOKEN`, navigate to <a href="https://dashboard-sandbox.dwolla.com/applications-legacy" target="_blank">https://dashboard-sandbox.dwolla.com/applications-legacy</a> and click the "Create Token" button. Copy the value that appears in the pop-up modal and use it to set `DWOLLA_ACCESS_TOKEN`. Note that the access token will only be valid for 60 minutes.

To set `DWOLLA_MASTER_ACCOUNT_ID`, navigate to <a href="https://dashboard-sandbox.dwolla.com/account/funding-sources" target="_blank">https://dashboard-sandbox.dwolla.com/account/funding-sources</a>. Copy the value of "ID" at the bottom of the "Superhero Savings Bank" card. Use this value to set `DWOLLA_MASTER_ACCOUNT_ID`. Superhero Savings Bank will represent the bank account for your app (i.e., it's where the fictional funds coming from a user's bank account will be deposited).

Be sure to save your changes!

#### Running the app

To start the app, run `make start` in the **pattern-af-tutorial/** directory. The app will run on localhost:3002. The app will continue to run as you progress through the tutorial.

Some code snippets contain `console.log()` statements that print out information related to the code in the snippet. They also print out success messages intended to help guide you as you progress through the checkpoints. For front end code, check the console in your browser to view the output of the `console.log()` statement. For back end code, run `make logs` in your terminal to view the output of the statement.

If you encounter issues when running the `make start` command, first ensure that Docker is running. If Docker is running and you're still encountering issues, try running `docker compose build server`. If you're still encountering issues after that, [file an Issue in this repo](https://github.com/plaid/account-funding-tutorial/issues).

### Let's start building

Great! Now that we've set up everything, let's start building. Here's an outline of what we'll cover in the tutorial:

* We'll start by implementing Link, generating a Link token and initializing with the Auth and Identity products
* Then we'll move to the back end, where we'll build functionality to:
  * Retrieve identity information to aid identity verification later
  * Retrieve initial account balance from **/identity/get**
  * Generate a processor token for Dwolla
  * Retrieve real-time account balance using **/accounts/balance/get**
  * Create a Dwolla customer, send Dwolla the processor token, and use the Dwolla API to move funds
* Finally, on the front end, we'll:
  * Write helper functions to help verify user identity and check account balance when a user initiates a transfer
  * Add the functionality to transfer funds

Let's get started!

### Checkpoint 1: Initializing Link with Auth and Identity

Plaid Link is the client-side component used to link bank accounts to an app. To use Link, we need to first generate a Link token and then initialize Link with that token.

Let's start in the back end. In the **pattern-af-tutorial/** directory, navigate to **server/routes/linkTokens.js**. This file defines the route for Link token creation. Take a look at the existing code that starts on line 42:

```js
const linkTokenParams = {
  user: {
    // This should correspond to a unique id for the current user.
    client_user_id: 'uniqueId' + userId,
  },
  client_name: 'Pattern',
  products,
  country_codes: ['US'],
  language: 'en',
  webhook: httpTunnel.public_url + '/services/webhook',
  access_token: accessToken,
};
 ```

The `linkTokenParams` object represents the parameters we'll use to generate a Link token. The `products` variable refers to the array of products we're initializing Link with (defined on line 29 of this file). Note that the `products` array initially contains only `'auth'`, but the logic on line 30 ensures we also initialize with `'identity'`. This is because using Identity is optional in the app.

Now let's move to the front end. Navigate to **client/src/services/link.tsx**. Take a look at the code that starts on line 63:

```js
const generateLinkToken = useCallback(async (userId, itemId, isIdentity) => {
    // if itemId is not null, update mode is triggered
    const linkTokenResponse = await getLinkToken(userId, itemId, isIdentity);
    if (linkTokenResponse.data.link_token) {
      const token = await linkTokenResponse.data.link_token;
      console.log('success', linkTokenResponse.data);

      if (itemId != null) {
        dispatch({
          type: 'LINK_TOKEN_UPDATE_MODE_CREATED',
          id: itemId,
          token: token,
        });
      } else {
        dispatch({ type: 'LINK_TOKEN_CREATED', id: userId, token: token });
      }
    } else {
      dispatch({ type: 'LINK_TOKEN_ERROR', error: linkTokenResponse.data });
      console.log('error', linkTokenResponse.data);
    }
  }, []);
```

The `generateLinkToken()` function generates a Link token. Under the hood, this function makes a call to `getLinkToken()` (defined in **[client/src/services/api.js](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/client/src/services/api.tsx#L64)**), which hits the route for Link token creation in **[server/routes/linkTokens.js](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/server/routes/linkTokens.js#L23)**.

At this point, you might be thinking: but where is Link actually initialized?

Navigate to **client/src/components/LinkButton.tsx**. This file defines the `LinkButton` component used in the UI. When clicked in the app, it'll initialize Link with a Link token (along with the configurations we specified for the token) and open Link. When a user successfully links their bank account, you'll receive a public token via Link's `onSuccess()` callback function. The public token can then be [exchanged for an access token](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/server/routes/items.js#L115), which can be used to make API calls to the linked bank account. For more details on the token exchange flow and Link, see [the official Plaid Link documentation](https://plaid.com/docs/link/).

That just about covers the Link implementation in the Pattern app! Let's move on to adding some more functionality.

### Checkpoint 2: Retrieve identity and initial balance information associated with the account

To verify identity later, we'll need the identity information associated with the linked bank account. We'll also need to establish an initial balance for the account so that we can use it later when a user initiates a transfer in the app.

Navigate to **server/routes/items.js**. On line 172, add the following:

```js
if (isIdentity) {
  const identityResponse = await plaid.identityGet(authAndIdRequest);
  emails = identityResponse.data.accounts[0].owners[0].emails.map(email => {
    return email.data;
  });

  ownerNames = identityResponse.data.accounts[0].owners[0].names;
  const fullName = ownerNames[0].split(' ');
  firstName = fullName[0];
  lastName = fullName[fullName.length - 1];

  if (isProcessor) {
    balances = identityResponse.data.accounts[0].balances;
  }
}
```

The `isIdentity` boolean in the code above represents whether the "Verify Identity Mode" checkbox was checked during account creation in the app. For the purposes of this tutorial, we'll assume it was checked, which sets `isIdentity` to true and executes the **/identity/get** call in the `if` block. From the response, we extract the owner names and emails associated with the account and store this information to verify user identity later.

The `isProcessor` boolean in the nested `if` statement represents whether a processor is being used to transfer funds. We're using Dwolla to transfer funds, so the code in the nested `if` block will execute. In this block, we retrieve the initial account balance from the **/identity/get** response.

Note that we didn't call **/accounts/balance/get** to retrieve initial balance information. This is because there are several Plaid products other than Balance (like Identity) that return balance information suitable for establishing an initial balance.  However, this data is typically updated about once a day and cached data is often returned, making it insufficient for real-time balance checks. In addition, **/accounts/balance/get** is billed on a per-request basis, so it's best (i.e., cost effective) to call it only when absolutely necessary. For subsequent balance checks in the app, we'll call **/accounts/balance/get** to retrieve the real-time balance. We'll provide more detail in a different checkpoint of the tutorial.

To try this code out, link a bank account in the app – you should see success messages in your console related to the code above. The app now retrieves identity and balance information for an account!

### Checkpoint 3: Generating a partner processor token

Next, we'll generate a partner processor token. This token will allow us to use Dwolla's API to transfer funds. On ~line 200 (after `let fundingSourceUrl = null;`), add the following:

```js
if (!isProcessor) {
  authResponse = await plaid.authGet(authAndIdRequest);
  authNumbers = authResponse.data.numbers.ach[0];
  balances = authResponse.data.accounts[0].balances;
} else {
  const processorRequest = {
    access_token: accessToken,
    account_id: account.id,
    processor: 'dwolla',
  };
  const processorTokenResponse = await plaid.processorTokenCreate(
    processorRequest
  );
  processorToken = processorTokenResponse.data.processor_token;

  customerUrl = await createDwollaCustomer(firstName, lastName);

  fundingSourceUrl = await createDwollaCustomerFundingSource(
    account,
    customerUrl,
    processorToken
  );
}
```

We're using a processor to transfer funds, so the code in the `else` block will execute. In the `else` block, we generate a processor token using Plaid's **/processor/token/create** endpoint. We also create a Dwolla Customer and obtain the corresponding Customer URL, which is necessary to create a Customer funding source. The funding source represents where a user's funds originate from when they transfer funds into the Pattern app.

Note that this bit of code won't function properly if you didn't enable the Dwolla integration in the Plaid dashboard [as described earlier in the tutorial setup](#enable-dwolla).

The `createDwollaCustomer()` and `createDwollaCustomerFundingSource()` functions represent Dwolla-specific code needed to make transfers later. If you're interested in the details, refer to their implementations in **[server/routes/items.js](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/server/routes/items.js#L47)**.

Check your console for success messages related to this code. If implemented correctly, you'll see the processor token, Customer URL, and Customer funding source URL all printed to the console. If you're running into errors, ensure you've set the `IS_PROCESSOR` variable to `true` in your **.env** file.

### Checkpoint 4: Parsing user name and email

Let's briefly move to the front end and add functionality that will help verify user identity.

When a user successfully creates an account in the app, they're redirected to their user page. This page is defined in **client/src/components/UserPage.tsx**. The page contains the user's name and email that was input when the account was created. We'll parse this information, save it, and later use it to verify the user's identity.

Inside of the `checkFullName()` function on line 72, add the following:

```js
if (fullname != null) {
  fullname = fullname.replace(',', ' ');
  const fullnameArray = fullname.split(' ');
  console.log(`Verifying name:`, fullname)
  console.log(`Checkpoint 4 (user name) complete!`)

  return fullnameArray.every(name => {
    return ownerNames.some(identName => {
      return identName.toUpperCase().indexOf(name.toUpperCase()) > -1;
    });
  });
}
return false;
```

Inside of the `checkEmail()` function on line 83, add the following:

```js
console.log(`Checking email:`, user_email)
console.log(`Checkpoint 4 (user email) complete!`)
return emails.includes(user_email);
```

The `checkFullName()` function will be used later to compare the user's name (from the user page) against the array of owner names returned earlier by **/identity/get**. If there is a match, the function returns true. Otherwise, it returns false.

The `checkUserEmail()` function checks that the user's email (from the user page) exists in the array of emails returned earlier by **/identity/get**. If it's present, the function returns true. Otherwise, it returns false.

In addition, note that we'll later verify identity by checking a user's full legal name and email address against the data returned by **/identity/get**. In practice, you'll find that there are many ways of verifying identity, but for the purposes of this tutorial, we'll use these two pieces of user information.

Try linking an account in the app. If successful, you should see the user's full name and email printed to your console.

### Checkpoint 5: Checking current account balance

Next, let's add code that will check the real-time balance of an account. Inside of the `getBalance()` function on line 61, add the following: 

```js
let timeSinceCreation = 0; // time in milliseconds
if (account != null) {
  timeSinceCreation =
    new Date().getTime() - new Date(account.created_at).getTime();
}

if (
  account != null &&
  item != null &&
  (account.number_of_transfers !== 0 ||
  timeSinceCreation > 60 * 60 * 1000 || // if it's been more than one hour 
  account.available_balance == null)
) {
  const { data: newAccount } = await getBalanceByItem(
    item.id,
    account.plaid_account_id
  );
  console.log(`Checkpoint 5 complete!`)
  console.log(`Getting new balance information...`)
  setAccount(newAccount || {});
} else {
  console.log(`Checkpoint 5 complete!`)
  console.log(`Don’t need to retrieve new balance just yet.`);
}
```

The `getBalance()` function retrieves the real-time balance of an account by calling **/accounts/balance/get**. The logic ensures that we retrieve real-time balance only on transfers initiated after the initial transfer (recall that for the initial transfer we use the balance information from **/identity/get**), or if more than one hour has elapsed since the last transfer (i.e., the last balance check).

So, when is this function used? We'll call this function when a user clicks the "Transfer Funds" button in the UI. Under the hood, this function makes a call to `getBalanceByItem()` (defined in **[client/src/services/api.js](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/client/src/services/api.tsx#L81)**), which hits a route that we'll define in the next checkpoint.

It's important to note that **/accounts/balance/get** is the only Plaid endpoint that returns real-time balance information. Although there are other Plaid endpoints that return balance information (i.e., **/identity/get**), you should avoid using the balance information they return if it's been less than 24 hours since the most recent call to that endpoint. This is because this balance data is typically updated about once a day, and cached data is often returned. For the most up-to-date balance information, always use **/accounts/balance/get**.

To test this code, link a bank account and then initiate a transfer. You should see the `Don't need to retrieve new balance just yet.` message in your console initially. The `Getting new balance information...` message will print once you've added in the transfer functionality, which you'll do in Checkpoints 8 and 9.

### Checkpoint 6: Retrieving real-time balance information

The `getBalance()` function in the previous checkpoint is called in the front end, and hits a route in the back end that makes a call to **/accounts/balance/get**. This route is yet to be defined, so let's return to the back end and add it in.

Navigate to **server/routes/items.js** and add the following on line 328:

```js
/**
 * Updates balances on account
 *
 * @param {number} itemId the ID of the item.
 * @param {string} accountId the account id.
 * @returns {Object[]} an array containing a single account.
 */
router.put(
  '/:itemId/balance',
  asyncWrapper(async (req, res) => {
    const { itemId } = req.params;
    const { accountId } = req.body;
    const { plaid_access_token: accessToken } = await retrieveItemById(itemId);
    const balanceRequest = {
      access_token: accessToken,
      options: {
        account_ids: [accountId],
      },
    };

    const balanceResponse = await plaid.accountsBalanceGet(balanceRequest);

    const account = balanceResponse.data.accounts[0];
    const updatedAccount = await updateBalances(
      accountId,
      account.balances.current,
      account.balances.available
    );
    console.log(`Checkpoint 6 complete!`)
    console.log(`Available balance:`, account.balances.available)
    res.json(updatedAccount[0]);
  })
);
```

This route returns information associated with a bank account, including the real-time balance. When a user clicks the "Transfer Funds" button in the UI, the `getBalance()` function will be called, which ultimately hits this route to return the balance.

This route won't be hit until you add the transfer functionality later in Checkpoints 8 and 9. If you're testing out this code, expect to see console output similar to what you observed in the previous checkpoint.

### Checkpoint 7: Verifying user identity

Let's take a look at how identity is verified in the app. Navigate to **client/src/components/UserPage.tsx** and take a look at the following code (don't add it, as it's already present):

```js
useEffect(() => {
  if (
    account != null &&
    isIdentityChecked === false &&
    user.should_verify_identity
  ) {
    const fullnameCheck = checkFullName(account.owner_names, user.fullname);
    const emailCheck = checkUserEmail(account!.emails, user.email);
    updateIdentityCheckById(userId, fullnameCheck && emailCheck); // update user_table in db
    setIsIdentityChecked(fullnameCheck && emailCheck); // set state
  }
}, [account, checkUserEmail, checkFullName, userId, isIdentityChecked, user]);
```

The code in this hook verifies the user's identity using the `checkFullName()` and `checkUserEmail()` functions we added earlier. It performs the verification by comparing the user's full name and email (from their user page) against the **/identity/get** data returned earlier (which we store in a database in a separate part of the codebase). This code executes only if the user's identity has not already been verified.

### Transferring funds with Dwolla

Let's recap what we've added so far:

* We've implemented Link and initialized with Auth and Identity
* In the back end:
  * We added functionality that retrieves identity and initial balance information associated with an account
  * We added functionality that generates a processor token so that we can use the Dwolla API for money movement
  * We added functionality that retrieves real-time balance information
* In the front end:
  * We added two functions that parse and return a user's legal name and email address (to help verify identity)
  * We added a function that retrieves the current balance of an account (to prevent transfers that exceed the balance of the origination account)

With this functionality in place, we're ready to add the functionality to transfer funds with Dwolla. 

### Checkpoint 8: Initiating a transfer

You've made it! Let's add the code that will initiate a transfer. Navigate to **client/src/components/Transfers.tsx**. On line 74, add the following in the `checkAmountAndInitiate()` function:

```js
setIsAmountOkay(balance != null && amount <= balance && amount > 0);
setTransferAmount(amount);
setShowTransferConfirmationError(false);
if (amount <= balance && amount > 0) {
  console.log(`Checkpoint 8 complete!`)
  console.log(`Sending to processor:`, amount);
  const confirmedAmount =
    IS_PROCESSOR === 'true'
      ? await sendRequestToProcessor(
          amount,
          account.funding_source_url,
          account.item_id
        )
      : completeAchTransfer(amount, account.plaid_account_id);
  if (confirmedAmount == null) {
    setShowTransferConfirmationError(true);
  } else {
    const response: TransferResponse | any = await updateAppFundsBalance(
      props.userId,
      confirmedAmount,
      account.plaid_account_id
    );
    props.setAppFund(response.data.newAppFunds);
    props.setAccount(response.data.newAccount);
    setIsTransferConfirmed(true);
  }
}
```

The `checkAmountAndInitiate()` function will attempt to transfer funds if the amount specified doesn't exceed the balance in the account and if the transfer amount is more than $0.00. Because we're using Dwolla, the funds will be transferred according to the logic in the `sendRequestToProcessor()` function (i.e., `IS_PROCESSOR` is true). Finally, the app is updated to reflect the newly available funds, and the number of successful transfers for this account is incremented by 1 (ensuring that **/accounts/balance/get** is called on subsequent transfers to return real-time balance information).

Try this code out by linking an account and initiating a transfer in the app. You should see a success message in your console for this checkpoint, along with the transfer amount being sent to the processor. `sendRequestToProcessor()` doesn't exist (yet), so you'll also see `Checkpoint #9: can't transfer to Dwolla yet` in the console.

In the next (and final!) checkpoint, we'll add the `sendRequestToProcessor()` function used in `checkAmountAndInitiate()`.

### Checkpoint 9: Sending the transfer request to Dwolla

Let's add the functionality that sends the transfer request to Dwolla. On line 59, in the `sendRequestToProcessor()` function, add:

```js
try {
  const createTransfer = await makeTransfer(
    funding_source_url,
    amount,
    itemId
  );
  console.log(`Checkpoint 9 complete!`);
  console.log(`Transfer amount:`, createTransfer.data.transfer.amount);
  return createTransfer.data.transfer.amount;
} catch (e) {
  if (e instanceof Error) {
    console.error('error', e.message);
  }
}
```

`sendRequestToProcessor()` calls Dwolla's **/transfers/** endpoint to make the transfer. Under the hood, this function makes a call to `makeTransfer()` (defined in **[client/src/services/api.js](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/client/src/services/api.tsx#L74)**), which hits the route for creating transfers with Dwolla (defined in **[server/routes/items.js](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/server/routes/items.js#L223)**).

The request payload includes `funding_source_url`, which is specific to this particular customer account. `funding_source_url` was originally returned by the Dwolla API and saved in a database when the processor token was passed to Dwolla (also defined in **[server/routes/items.js](https://github.com/plaid/account-funding-tutorial/blob/main/pattern-af-tutorial/server/routes/items.js#L76)**).

### Let's try it all out!

At this point, you should have a fully functioning app with account funding. Run `make start` in the **pattern-af-tutorial/** directory. When the app is ready, navigate to http://localhost:3002. Create a user (be sure to check "Verify Identity Mode"), link a bank account, and initiate a transfer.

After completing the transfer, navigate to the [Customers section of your Dwolla sandbox account](https://dashboard-sandbox.dwolla.com/customers). This page of your account shows all of the users for whom you have created a funding source with Dwolla (i.e., users you created when using the Pattern app). In the [Transactions section of your account](https://dashboard-sandbox.dwolla.com/transactions), you'll see a list of all transactions into your account. If you are able to verify the transfers you've initiated via Pattern on these pages, then you've successfully built account funding! Congrats!

### Next steps

So, what'd you think? We'd love your feedback on the tutorial. We'll use it to improve this tutorial and future Plaid tutorials. To leave feedback, visit [Feedback: Account Funding Tutorial](https://github.com/plaid/account-funding-tutorial/issues/7). Thanks in advance!

For more resources on account funding, see the following:

* [Auth](https://plaid.com/docs/auth/), [Balance](https://plaid.com/docs/balance/), [Identity](https://plaid.com/docs/identity/) documentation

* [Plaid Payment Partners](https://plaid.com/docs/auth/partnerships/)

Other official Plaid resources you might be interested in:

  * [Plaid Pattern (Personal Finance Management)](https://github.com/plaid/pattern) app – Similar to Plaid Pattern (Account Funding), but with a focus on personal finance management

  * [Plaid's Quickstart](https://github.com/plaid/quickstart) – Get started with a React front end and back end of your choice (Python, Ruby, Node, Java, or Go)

  * [Plaid's Tiny Quickstart](https://github.com/plaid/tiny-quickstart) – A minimal app that implements Plaid Link, Balances, and OAuth (available in vanilla JS and React)

  * [Plaid's YouTube channel](https://www.youtube.com/c/PlaidInc/videos) – A collection of Plaid Academy videos that explain various aspects of Plaid, including OAuth

