// =================================================================

// No packets are sent by the server on first fetch.

// =================================================================
const net = require('net');

let receivedPackets = [];
let missedPackets = [];

const validatePackets = (packets) => {
    let isValid = true;
    const invalidPackets = [];

    for (let i = 0; i < packets.length; i++) {
        const packet = packets[i];

        // Check for dummy packets or invalid data (e.g., NaN values)
        if (!packet.symbol || !packet.buySellIndicator || isNaN(packet.quantity) || isNaN(packet.price) || isNaN(packet.sequence)) {
            isValid = false;
            invalidPackets.push(i + 1);  // Log the sequence number of the invalid packet
        }

        // Check for sequence correctness
        if (packet.sequence !== i + 1) {
            isValid = false;
            invalidPackets.push(i + 1);
        }
    }

    return { isValid, invalidPackets };
}

const fetch = async () => {
    try {
        await fetchPackets();

        if (missedPackets.length > 0) {
            await fetchMissingPackets();
        }

        const validationResult = validatePackets(receivedPackets);
        if (!validationResult.isValid) {
            throw new Error('Invalid packets detected:', validationResult.invalidPackets);
        } else {
            console.log('All packets are valid');
        }

        return receivedPackets;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;
    }
}

const fetchPackets = () => {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({ port: process.env.CLIENT_PORT }, () => {
            console.log('Connected to the server');
        });

        client.on('ready', () => {
            console.log('Requesting packets');
            client.write(Buffer.from([1]), (err) => {
                if (err) {
                    reject(err);
                } else {
                    client.end();  // We are done requesting
                }
            });
        });

        client.on('data', (data) => {
            console.log("Received data from server");

            // Safeguard against incomplete data
            try {
                let offset = 0;
                while (offset + 17 <= data.length) {  // Ensure complete packet exists
                    const symbol = data.toString('ascii', offset, offset + 4);
                    const buySellIndicator = data.toString('ascii', offset + 4, offset + 5);
                    const quantity = data.readInt32BE(offset + 5);
                    const price = data.readInt32BE(offset + 9);
                    const sequence = data.readInt32BE(offset + 13);

                    if (sequence > receivedPackets.length) {
                        while (receivedPackets.length + 1 < sequence) {
                            receivedPackets.push({
                                symbol: "",
                                buySellIndicator: "",
                                quantity: NaN,
                                price: NaN,
                                sequence: NaN
                            });
                            missedPackets.push(receivedPackets.length);
                        }

                        receivedPackets.push({ symbol, buySellIndicator, quantity, price, sequence });
                    }

                    offset += 17; // Move to the next packet
                }
            } catch (parseError) {
                console.error("Error parsing data:", parseError);
            }
        });

        client.on('end', () => {
            console.log('Connection ended');
        });

        client.on('close', () => {
            console.log('Connection closed');
            resolve();
        });

        client.on('error', (err) => {
            console.error('Client encountered an error:', err);
            reject(err);
        });
    });
}

const fetchMissingPackets = () => {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({ port: process.env.CLIENT_PORT }, () => {
            console.log('Connected to the server for missing packets');
        });

        const requestPacket = (sequence) => {
            client.write(Buffer.from([2, sequence]), (err) => {
                if (err) {
                    console.error(`Error requesting packet ${sequence}:`, err);
                    reject(err);
                } else {
                    console.log(`Requested missing packet ${sequence}`);
                }
            });
        }

        client.on('ready', () => {
            if (missedPackets.length > 0) {
                requestPacket(missedPackets.shift());
            } else {
                console.log('No missing packets to request');
                resolve();
            }
        });

        client.on('data', (data) => {
            console.log("Received missing packet from server");

            try {
                const symbol = data.toString('ascii', 0, 4);
                const buySellIndicator = data.toString('ascii', 4, 5);
                const quantity = data.readInt32BE(5);
                const price = data.readInt32BE(9);
                const sequence = data.readInt32BE(13);

                receivedPackets[sequence - 1] = { symbol, buySellIndicator, quantity, price, sequence };

                if (missedPackets.length > 0) {
                    requestPacket(missedPackets.shift());
                } else {
                    console.log('All missing packets received');
                    client.end();  // Close the connection gracefully
                }
            } catch (parseError) {
                console.error("Error parsing missing packet data:", parseError);
            }
        });

        client.on('end', () => {
            console.log('Missing packets connection ended');
        });

        client.on('close', () => {
            console.log('Missing packets connection closed');
            resolve();
        });

        client.on('error', (err) => {
            console.error('Error in missing packets connection:', err);
            reject(err);
        });
    });
}

module.exports = fetch;
