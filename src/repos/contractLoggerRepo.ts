import {
  ContractLoggerModel,
  IContractLogger
} from '../models/contractLogger.js';

async function create(doc: IContractLogger): Promise<IContractLogger> {
  return await ContractLoggerModel.create(doc);
}

async function findByopNum(opNum: number): Promise<IContractLogger | null> {
  return ContractLoggerModel.findOne({
    opNum: opNum
  });
}

const ContractLoggerRepo = {
  create,
  findByopNum
};

export default ContractLoggerRepo;
