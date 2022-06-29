import { ConnectButton } from "web3uikit"

export const Header = ()=> {
    return (
        <header className={header}>
            <h1 className={h1}>Decentralized Crowdfund</h1>
            <div className={divtnContainer}>
                <ConnectButton moralisAuth={false} />
            </div>
        </header>
    );
}

const header = `p-5 border-b-2 flex flex-row`;
const h1 = `py-4 px-4 font-blog text-3xl`;
const divtnContainer = `ml-auto py-2 px-4`;