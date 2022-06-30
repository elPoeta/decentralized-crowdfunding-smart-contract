import { ConnectButton } from "web3uikit"
import { LaunchCampaignButton } from "./LaunchCampaignButton";

export const Header = ()=> {
    return (
        <header className={header}>
            <h1 className={h1}>Decentralized Crowdfund</h1>
            <div className={divtnContainer}>
                <LaunchCampaignButton />
                <ConnectButton moralisAuth={false} />
            </div>
        </header>
    );
}

const header = `p-5 border-b-2 flex flex-row`;
const h1 = `py-4 px-4 font-blog text-3xl`;
const divtnContainer = `flex items-center ml-auto py-2 px-4`;