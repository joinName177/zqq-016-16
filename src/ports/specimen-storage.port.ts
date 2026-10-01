import { LifeSpecimen } from '../core/models';

export interface SpecimenStoragePort {
  getAll(): LifeSpecimen[];
  save(specimen: LifeSpecimen): void;
  remove(id: string): void;
  /** 修剪级联：移出所有溯源至给定节点集合的标本 */
  removeByNodeIds(nodeIds: string[]): void;
  clear(): void;
}
