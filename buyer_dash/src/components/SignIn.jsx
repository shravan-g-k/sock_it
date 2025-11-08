import { createClient } from "@supabase/supabase-js";
import logo from "../assets/token3pic.png"
import metamaskIcon from "../assets/Metamask-01.jpg"
import "../css/signIn.css"
const supabase = createClient(
  "https://tgvqgezpzssytufqmjdn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndnFnZXpwenNzeXR1ZnFtamRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTE1NjgsImV4cCI6MjA3ODA4NzU2OH0.5c0HGlOQcjmPEsEp7rmx_APLYb0Y1UpkBGXOWK1zDck"
);

export default function SignIn({ onLogIn }) {
  const loginWithMetaMask = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found! Please install MetaMask.");
        return;
      }

      // 🪙 Request wallet
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];

      // 🧾 SIWE message
      const domain = window.location.host;
      const uri = window.location.origin;
      const statement = "Sign in to our Supabase dApp securely.";
      const version = "1";
      const chainId = 1;
      const nonce = Math.random().toString(36).substring(2, 15);
      const issuedAt = new Date().toISOString();

      const message = `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;

      // ✍️ Sign message
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      // 🔗 Verify with Supabase
      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: "ethereum",
        message,
        signature,
      });

      if (error) {
        console.error("❌ Login failed:", error);
        alert("Login failed: " + error.message);
        return;
      }

      console.log("✅ Logged in:", data);
      alert("🎉 Logged in successfully with MetaMask!");
      onLogIn(); // ✅ Trigger parent callback

      // 🧩 Check if user exists in DB
      const { data: existingUser, error: fetchError } = await supabase
        .from("userData")
        .select("UserWalletAddress")
        .eq("UserWalletAddress", address)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking user:", fetchError);
        return;
      }

      if (!existingUser) {
        console.log("🆕 New user detected — adding to database...");
        const { error: insertError } = await supabase.from("userData").insert([
          {
            UserWalletAddress: address,
            UserType: "S", // 'B' FOR BUYER 'S' FOR SELLER
            created_at: new Date().toISOString(),
          },
        ]);

        if (insertError) {
          console.error("Insert error:", insertError);
        } else {
          console.log("✅ New user added to DB");
        }
      } else {
        console.log("👋 User already exists:", existingUser);
      }

      // ✅ Call loggedIn after everything
      onLogIn();

    } catch (err) {
      console.error("Error during login:", err);
    }
  };

  

  return (
    <div className="SignInContainer">
      <div className="box">
        <h1 className="heading">Sock .it </h1>
        <h3>Building a Blockchain-Based Real Estate Platform</h3>
        <img className="tokenimage" src={logo} alt="logo" height="300px"/>
        <button className="SignInBtn" onClick={loginWithMetaMask}>
            <span className="metamask-icon">
                <img src={metamaskIcon} alt="meta mask icon" height="40px" />
            </span>
            Sign In with MetaMask
        </button>
        </div>
    </div>
  );
}
