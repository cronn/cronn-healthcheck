import * as dns from "dns";
import * as http from "http";
import * as https from "https";

export interface Response {
    body: string;
    code: number;
    latencyMs: number;
}

export const request = (options: http.RequestOptions) => new Promise<Response>((resolve, reject) => {

    const callback = (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
            data += chunk;
        });

        resp.on("end", () => {
            resolve({ body: data, code: resp.statusCode, latencyMs: Date.now() - startMs });
        });
    };

    const errCallback = (err: any) => {
        reject(err);
    };

    const startMs = Date.now();

    if (options.protocol === "https:") {
        https.get(options, callback).on("error", errCallback);
    } else {
        http.get(options, callback).on("error", errCallback);
    }
});

export const lookup = (host: string) => new Promise<void>((resolve, reject) => {
    dns.lookup(host, (err, hostname, service) => {
        if (err) {
            reject(err);
        }
        resolve();
    });
});
