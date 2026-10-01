import { LifeSpecimen } from '../core/models';

export interface SpecimenStoragePort {
  getAll(): LifeSpecimen[];
  save(specimen: LifeSpecimen): void;
  remove(id: string): void;
  removeMany(ids: string[]): void;
  clear(): void;
}
