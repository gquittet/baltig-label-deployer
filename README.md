# BalTig Automatisation

⚠️ This project is the first part to automate repetitive tasks with a popular Git plateform.

## How to use

See [.env.example](.env.example) for required environement variables


### Add deploy labels
```sh
npx @gquittet/baltig-label-deployer --host https://example.com --token my_token --project my_project --deploy
```

### Start a new milestone
```sh
npx @gquittet/baltig-label-deployer --host https://example.com --token my_token --project my_project --milestone
```
