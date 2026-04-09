const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createTreatmentService = async (treatmentData) => {
  const treatmentuuid = uuidv4();

  const {
    name,
    slug,
    specialty_id,
    treatment_image,
    png_logo,
    overview_description,
    key_benefits,
    who_gets_description,
    ideal_candidates,
    not_suitable_for,
    causes_description,
    causes_list,
    symptoms_description,
    symptoms_list,
    diagnosis_description,
    diagnosis_steps,
    treatment_procedure_description,
    pre_operative_steps,
    surgical_procedure_steps,
    post_operative_steps,
    cost_description,
    cost_ranges,
    cost_factors,
    ayushman_covered,
    ayushman_description,
    ayushman_benefits,
    ayushman_eligibility,
    ayushman_claim_steps,
    surgery_duration,
    hospital_stay,
    recovery_time,
    success_rate,
    faqs,
    comes_in
  } = treatmentData;


  const query = `
    INSERT INTO treatments (
      uuid,
      name,
      slug,
      specialty_id,
      treatment_image,
      png_logo,
      overview_description,
      key_benefits,
      who_gets_description,
      ideal_candidates,
      not_suitable_for,
      causes_description,
      causes_list,
      symptoms_description,
      symptoms_list,
      diagnosis_description,
      diagnosis_steps,
      treatment_procedure_description,
      pre_operative_steps,
      surgical_procedure_steps,
      post_operative_steps,
      cost_description,
      cost_ranges,
      cost_factors,
      ayushman_covered,
      ayushman_description,
      ayushman_benefits,
      ayushman_eligibility,
      ayushman_claim_steps,
      surgery_duration,
      hospital_stay,
      recovery_time,
      success_rate,
      faqs,
      comes_in,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, $34, $35, NOW(), NOW()
    ) RETURNING *;
  `;

  const values = [
    treatmentuuid,
    name,
    slug,
    specialty_id,
    treatment_image,
    png_logo,
    overview_description,
    key_benefits,                        // TEXT[] — raw array
    who_gets_description,
    ideal_candidates,                    // TEXT[] — raw array
    not_suitable_for,                    // TEXT[] — raw array
    causes_description,
    JSON.stringify(causes_list),         // JSONB — array of objects
    symptoms_description,
    JSON.stringify(symptoms_list),       // JSONB — array of objects
    diagnosis_description,
    JSON.stringify(diagnosis_steps),     // JSONB — array of objects
    treatment_procedure_description,
    pre_operative_steps,                 // TEXT[] — raw array
    surgical_procedure_steps,            // TEXT[] — raw array
    post_operative_steps,                // TEXT[] — raw array
    cost_description,
    JSON.stringify(cost_ranges),         // JSONB — array of objects
    cost_factors,                        // TEXT[] — raw array
    ayushman_covered,
    ayushman_description,
    ayushman_benefits,                   // TEXT[] — raw array
    ayushman_eligibility,                // TEXT[] — raw array
    ayushman_claim_steps,                // TEXT[] — raw array
    surgery_duration,
    hospital_stay,
    recovery_time,
    success_rate,
    JSON.stringify(faqs),                // JSONB — array of objects
    comes_in ?? null
  ];

  const result = await pool.query(query, values);
  return result.rows;
}

const getAllTreatmentService = async () => {
  const query = `SELECT * FROM treatments;`;
  const result = await pool.query(query);
  return result.rows;
}

const getTreatmentBySpecialtyIdService = async (specialty_id) => {
  const query = `SELECT * FROM treatments WHERE specialty_id = $1;`;
  const result = await pool.query(query, [specialty_id]);
  return result.rows; // ✅ returns all, empty array if none
};

const updateTreatmentService = async (id, data) => {
  const {
    name, slug, specialty_id, treatment_image, png_logo,
    overview_description, key_benefits, who_gets_description,
    ideal_candidates, not_suitable_for, causes_description, causes_list,
    symptoms_description, symptoms_list, diagnosis_description, diagnosis_steps,
    treatment_procedure_description, pre_operative_steps, surgical_procedure_steps,
    post_operative_steps, cost_description, cost_ranges, cost_factors,
    ayushman_covered, ayushman_description, ayushman_benefits,
    ayushman_eligibility, ayushman_claim_steps, surgery_duration,
    hospital_stay, recovery_time, success_rate, faqs, comes_in
  } = data;
 
  const query = `
    UPDATE treatments SET
      name                           = COALESCE($1,  name),
      slug                           = COALESCE($2,  slug),
      specialty_id                   = COALESCE($3,  specialty_id),
      treatment_image                = COALESCE($4,  treatment_image),
      png_logo                       = COALESCE($5,  png_logo),
      overview_description           = COALESCE($6,  overview_description),
      key_benefits                   = COALESCE($7,  key_benefits),
      who_gets_description           = COALESCE($8,  who_gets_description),
      ideal_candidates               = COALESCE($9,  ideal_candidates),
      not_suitable_for               = COALESCE($10, not_suitable_for),
      causes_description             = COALESCE($11, causes_description),
      causes_list                    = COALESCE($12, causes_list),
      symptoms_description           = COALESCE($13, symptoms_description),
      symptoms_list                  = COALESCE($14, symptoms_list),
      diagnosis_description          = COALESCE($15, diagnosis_description),
      diagnosis_steps                = COALESCE($16, diagnosis_steps),
      treatment_procedure_description= COALESCE($17, treatment_procedure_description),
      pre_operative_steps            = COALESCE($18, pre_operative_steps),
      surgical_procedure_steps       = COALESCE($19, surgical_procedure_steps),
      post_operative_steps           = COALESCE($20, post_operative_steps),
      cost_description               = COALESCE($21, cost_description),
      cost_ranges                    = COALESCE($22, cost_ranges),
      cost_factors                   = COALESCE($23, cost_factors),
      ayushman_covered               = COALESCE($24, ayushman_covered),
      ayushman_description           = COALESCE($25, ayushman_description),
      ayushman_benefits              = COALESCE($26, ayushman_benefits),
      ayushman_eligibility           = COALESCE($27, ayushman_eligibility),
      ayushman_claim_steps           = COALESCE($28, ayushman_claim_steps),
      surgery_duration               = COALESCE($29, surgery_duration),
      hospital_stay                  = COALESCE($30, hospital_stay),
      recovery_time                  = COALESCE($31, recovery_time),
      success_rate                   = COALESCE($32, success_rate),
      faqs                           = COALESCE($33, faqs),
      comes_in                       = COALESCE($34, comes_in),
      updated_at                     = NOW()
    WHERE id = $35
    RETURNING *;
  `;
 
  const values = [
    name           || null,
    slug           || null,
    specialty_id   || null,
    treatment_image|| null,
    png_logo       || null,
    overview_description            || null,
    key_benefits   ? key_benefits   : null,
    who_gets_description            || null,
    ideal_candidates? ideal_candidates : null,
    not_suitable_for? not_suitable_for : null,
    causes_description              || null,
    causes_list    ? JSON.stringify(causes_list)    : null,
    symptoms_description            || null,
    symptoms_list  ? JSON.stringify(symptoms_list)  : null,
    diagnosis_description           || null,
    diagnosis_steps? JSON.stringify(diagnosis_steps): null,
    treatment_procedure_description || null,
    pre_operative_steps  ? pre_operative_steps  : null,
    surgical_procedure_steps? surgical_procedure_steps: null,
    post_operative_steps ? post_operative_steps : null,
    cost_description                || null,
    cost_ranges    ? JSON.stringify(cost_ranges)    : null,
    cost_factors   ? cost_factors   : null,
    ayushman_covered !== undefined  ? ayushman_covered : null,
    ayushman_description            || null,
    ayushman_benefits ? ayushman_benefits : null,
    ayushman_eligibility? ayushman_eligibility: null,
    ayushman_claim_steps? ayushman_claim_steps: null,
    surgery_duration || null,
    hospital_stay    || null,
    recovery_time    || null,
    success_rate     || null,
    faqs           ? JSON.stringify(faqs)           : null,
    comes_in         || null,
    id
  ];
 
  const result = await pool.query(query, values);
  if (!result.rows[0]) throw new Error('Treatment not found');
  return result.rows[0];
};

module.exports = { createTreatmentService, getAllTreatmentService, getTreatmentBySpecialtyIdService, updateTreatmentService }