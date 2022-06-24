/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface CrowdfundFactoryInterface extends utils.Interface {
  functions: {
    "createCrowdfund()": FunctionFragment;
    "getAddressesDeployed()": FunctionFragment;
    "getCrowdfundDeployed()": FunctionFragment;
    "i_owner()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "createCrowdfund"
      | "getAddressesDeployed"
      | "getCrowdfundDeployed"
      | "i_owner"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "createCrowdfund",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAddressesDeployed",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCrowdfundDeployed",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "i_owner", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "createCrowdfund",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAddressesDeployed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCrowdfundDeployed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "i_owner", data: BytesLike): Result;

  events: {
    "crowdfundCreated(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "crowdfundCreated"): EventFragment;
}

export interface crowdfundCreatedEventObject {
  crowdfundAddress: string;
}
export type crowdfundCreatedEvent = TypedEvent<
  [string],
  crowdfundCreatedEventObject
>;

export type crowdfundCreatedEventFilter =
  TypedEventFilter<crowdfundCreatedEvent>;

export interface CrowdfundFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: CrowdfundFactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    createCrowdfund(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getAddressesDeployed(overrides?: CallOverrides): Promise<[string[]]>;

    getCrowdfundDeployed(overrides?: CallOverrides): Promise<[string[]]>;

    i_owner(overrides?: CallOverrides): Promise<[string]>;
  };

  createCrowdfund(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getAddressesDeployed(overrides?: CallOverrides): Promise<string[]>;

  getCrowdfundDeployed(overrides?: CallOverrides): Promise<string[]>;

  i_owner(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    createCrowdfund(overrides?: CallOverrides): Promise<void>;

    getAddressesDeployed(overrides?: CallOverrides): Promise<string[]>;

    getCrowdfundDeployed(overrides?: CallOverrides): Promise<string[]>;

    i_owner(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "crowdfundCreated(address)"(
      crowdfundAddress?: null
    ): crowdfundCreatedEventFilter;
    crowdfundCreated(crowdfundAddress?: null): crowdfundCreatedEventFilter;
  };

  estimateGas: {
    createCrowdfund(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getAddressesDeployed(overrides?: CallOverrides): Promise<BigNumber>;

    getCrowdfundDeployed(overrides?: CallOverrides): Promise<BigNumber>;

    i_owner(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    createCrowdfund(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getAddressesDeployed(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCrowdfundDeployed(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    i_owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}