FROM rust:1.76.0 as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:stable-slim
COPY --from=builder /usr/src/app/target/release/spammer /usr/local/bin/
CMD ["/usr/local/bin/spammer"]
