// content/index.ts

import * as microbiology from './microbiology.config'
import * as analyticalChemistry from './analytical-chemistry.config'
import * as bioethics from './bioethics.config'
import * as molecularPharmacology from './molecular-pharmacology.config'

export const subjectsConfig = [
  microbiology,
  analyticalChemistry,
  bioethics,
  molecularPharmacology,
].filter(subject => subject.subject.isActive !== false)