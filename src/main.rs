use std::{
    io::Write,
    net::{Ipv4Addr, SocketAddr, TcpListener, TcpStream},
    thread,
    time::Duration,
};

use clap::Parser;

#[derive(Parser, Debug, Clone, Copy)]
struct Args {
    /// Which port to accept connections on.
    #[clap(env = "SPAMMER_PORT", short)]
    port: u16,
    /// How many times to write to each connection.
    #[clap(env = "SPAMMER_COUNT", short)]
    count: usize,
    /// Bytes in one write.
    #[clap(env = "SPAMMER_SIZE", short)]
    size: usize,
    /// How many milliseconds to sleep between writes.
    #[clap(env = "SPAMMER_DELAY_MS", short)]
    delay_ms: u64,
}

fn serve(mut stream: TcpStream, args: Args) {
    let chunk = vec![b'A'; args.size];

    for _ in 0..args.count {
        stream.write_all(&chunk).expect("write failed");
        stream.flush().expect("flush failed");
        thread::sleep(Duration::from_millis(args.delay_ms));
    }

    eprintln!(
        "finished spamming to {}",
        stream.peer_addr().expect("failed to get peer address")
    );
}

fn main() {
    let args = Args::parse();

    let address = SocketAddr::new(Ipv4Addr::UNSPECIFIED.into(), args.port);
    let listener = TcpListener::bind(address).expect("failed to bind listener");

    loop {
        let (stream, peer) = listener.accept().expect("failed to accept");
        eprintln!("accepted connection from {peer}");

        thread::spawn(move || serve(stream, args));
    }
}
