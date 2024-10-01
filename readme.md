# BetaCrew Assignment

This is a Node.js application developed as part of the assignment for Node.js Mage by BetaCrew. The application includes a server implementation to interact with a mock exchange.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [Author](#author)
- [License](#license)

## Installation

To get started with the project, clone this repository and install the necessary dependencies:

```bash
git clone https://github.com/kushagra0304/betaCrewAssigment.git
cd betacrewassignment
npm install
```

## Usage

You can run the application by starting the server or the main entry point:

- To start the main application:

```bash
npm start
```

- To run the exchange server:

```bash
npm run server
```

## Output

The output json file is saved in the src/output directory.

## Scripts

This project includes the following scripts:

- `test`: Runs the test (currently not implemented).
- `server`: Starts the exchange server using `main.js` in the `betacrew_exchange_server` directory.
- `start`: Starts the main application from `src/index.js`.

## Dependencies

This project uses the following dependencies:

- [dotenv](https://www.npmjs.com/package/dotenv): Loads environment variables from a `.env` file.

## Author

- **Kushagra Agarwal**

## License

This project is licensed under the ISC License.