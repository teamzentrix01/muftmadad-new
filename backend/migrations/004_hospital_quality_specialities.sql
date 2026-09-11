BEGIN;
DO $$ DECLARE entry record; BEGIN
FOR entry IN SELECT * FROM (VALUES
('Cardiology','cardiology',1),
('General Medicine','general-medicine',2),
('General Surgery','general-surgery',3),
('Emergency Medicine','emergency-medicine',4),
('Neurosurgery','neurosurgery',5),
('Psychiatry','psychiatry',6),
('Orthopedics','orthopedics',7),
('Gynecology','gynecology',8),
('Pediatrics','pediatrics',9),
('Ophthalmology','ophthalmology',10),
('ENT (Ear, Nose, Throat)','ent-ear-nose-throat',11),
('Gastroenterology','gastroenterology',12),
('Nephrology','nephrology',13),
('Urology','urology',14),
('Oncology','oncology',15),
('Endocrinology','endocrinology',16),
('Dermatology','dermatology',17),
('Oral & Maxillofacial Surgeon','oral-maxillofacial-surgeon',18),
('Emergency / Trauma','emergency-trauma',19),
('Radiology','radiology',20),
('Blood Bank','blood-bank',21),
('Dentistry','dentistry',22),
('Audiology','audiology',23),
('Physiotherapy','physiotherapy',24),
('Pathology','pathology',25)) AS requested(name,slug,position) LOOP
IF EXISTS(SELECT 1 FROM specialities WHERE lower(trim(name_en))=lower(entry.name) OR slug=entry.slug) THEN
UPDATE specialities SET is_active=true WHERE lower(trim(name_en))=lower(entry.name) OR slug=entry.slug;
ELSE INSERT INTO specialities(name_en,slug,display_order,is_active) VALUES(entry.name,entry.slug,entry.position,true);
END IF; END LOOP; END $$;
COMMIT;
