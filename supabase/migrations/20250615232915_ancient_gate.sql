/*
  # Update Contract Chunks with Enhanced RAG Data

  1. Clear existing data and insert comprehensive examples
  2. Add more diverse contract examples for better RAG performance
  3. Include examples for different tones and analysis styles
  4. Expand coverage for general, lease, and employment contracts

  ## Changes
  - Clear existing contract_chunks data
  - Insert 15 examples for each document type (45 total)
  - Include varied examples covering different contract scenarios
  - Add examples that demonstrate different red flag patterns
*/

-- Clear existing contract chunks data
DELETE FROM public.contract_chunks;

-- Insert comprehensive general contract examples
INSERT INTO public.contract_chunks (doc_name, chunk_text, chunk_index, doc_type) VALUES
-- General Contract Examples (15 examples)
('general_comprehensive', 'Service agreements should clearly define scope, deliverables, and timelines. Red flags include: vague descriptions like "as needed," unlimited revisions, and scope creep without additional compensation. Fair contracts specify exact deliverables, revision limits, and change order procedures.', 1, 'general'),

('general_comprehensive', 'Payment terms must specify amounts, schedules, and late fees. Warning signs: "payment when convenient," net-90+ terms for small businesses, automatic rate increases without caps, and penalties exceeding 1.5% monthly interest. Reasonable terms include net-30 payment, clear invoicing procedures, and proportional late fees.', 2, 'general'),

('general_comprehensive', 'Liability and indemnification clauses allocate risk between parties. Concerning provisions: unlimited liability exposure, broad indemnification for any claims, and one-sided risk allocation. Balanced contracts include liability caps, mutual indemnification, and exclusions for gross negligence.', 3, 'general'),

('general_comprehensive', 'Intellectual property ownership should be clearly defined. Red flags: automatic assignment of all IP, claims to pre-existing work, and broad work-for-hire definitions. Fair terms distinguish between commissioned work and contractor-owned tools, with clear ownership boundaries.', 4, 'general'),

('general_comprehensive', 'Termination clauses should be mutual and reasonable. Warning signs: termination for convenience by one party only, immediate termination without cure periods, and forfeiture of all payments upon termination. Balanced agreements allow mutual termination with appropriate notice.', 5, 'general'),

('general_comprehensive', 'Confidentiality agreements protect sensitive information but should be reasonable in scope. Concerning terms: indefinite confidentiality periods, overly broad definitions of confidential information, and restrictions on using general skills. Fair NDAs have time limits and clear exceptions.', 6, 'general'),

('general_comprehensive', 'Force majeure clauses excuse performance during extraordinary events. Red flags: narrow definitions excluding common disruptions, no notice requirements, and immediate termination rights. Comprehensive clauses cover various unforeseeable events with reasonable notice and mitigation requirements.', 7, 'general'),

('general_comprehensive', 'Dispute resolution mechanisms should be fair and accessible. Warning signs: mandatory arbitration in distant locations, waiver of class action rights, and one-sided attorney fee provisions. Balanced approaches include mediation first, reasonable arbitration locations, and mutual fee-shifting.', 8, 'general'),

('general_comprehensive', 'Amendment and modification procedures protect both parties from unauthorized changes. Concerning provisions: oral modifications allowed, unilateral change rights, and automatic updates by reference to external documents. Secure contracts require written amendments signed by both parties.', 9, 'general'),

('general_comprehensive', 'Warranty and representation clauses establish baseline expectations. Red flags: "as-is" disclaimers for professional services, no warranties on fitness for purpose, and broad liability exclusions. Reasonable warranties include professional workmanship and compliance with specifications.', 10, 'general'),

('general_comprehensive', 'Assignment and delegation rights determine transferability of obligations. Warning signs: unrestricted assignment by one party, prohibition on assignment by the other, and automatic assignment upon change of control. Balanced terms require consent for assignment with reasonable exceptions.', 11, 'general'),

('general_comprehensive', 'Compliance and regulatory requirements ensure legal adherence. Concerning omissions: no mention of applicable laws, failure to address industry regulations, and shifting compliance costs to one party. Comprehensive contracts address relevant legal requirements and shared compliance responsibilities.', 12, 'general'),

('general_comprehensive', 'Performance standards and metrics establish clear expectations. Red flags: subjective approval requirements, moving targets without notice, and penalties for factors beyond control. Fair agreements include objective criteria, reasonable performance windows, and force majeure protections.', 13, 'general'),

('general_comprehensive', 'Insurance and bonding requirements protect against risks. Warning signs: excessive coverage amounts, specialized insurance types, and retroactive coverage requirements. Reasonable provisions align with industry standards and actual risk exposure levels.', 14, 'general'),

('general_comprehensive', 'Entire agreement and integration clauses prevent external claims. Concerning language: partial integration allowing oral additions, broad exceptions for prior agreements, and unclear superseding language. Complete integration clauses clearly state the contract represents the entire agreement between parties.', 15, 'general'),

-- Lease Agreement Examples (15 examples)
('lease_comprehensive', 'Residential lease terms should specify rent amount, due dates, and acceptable payment methods. Red flags: daily late fees, cash-only payments, and automatic rent increases exceeding local caps. Fair leases include reasonable grace periods, multiple payment options, and predictable rent adjustment procedures.', 1, 'lease'),

('lease_comprehensive', 'Security deposit provisions must comply with local laws regarding amounts and return procedures. Warning signs: non-refundable deposits, excessive amounts (over 2 months rent), and vague damage definitions. Proper deposits include itemized deduction lists, interest requirements, and specific return timelines.', 2, 'lease'),

('lease_comprehensive', 'Maintenance and repair responsibilities should be clearly allocated between landlord and tenant. Concerning clauses: tenant responsible for all repairs including structural, landlord entry without notice, and charges for normal wear and tear. Balanced agreements distinguish between tenant care and landlord maintenance obligations.', 3, 'lease'),

('lease_comprehensive', 'Occupancy and guest policies should be reasonable and clearly stated. Red flags: prohibition on overnight guests, restrictions on family visits, and unlimited landlord discretion over occupants. Fair policies allow reasonable guest privileges while protecting property and other tenants.', 4, 'lease'),

('lease_comprehensive', 'Pet policies should be consistent and non-discriminatory. Warning signs: blanket pet bans in pet-friendly buildings, excessive pet deposits, and breed restrictions beyond insurance requirements. Reasonable policies include standard pet fees, clear pet rules, and accommodation for service animals.', 5, 'lease'),

('lease_comprehensive', 'Lease renewal and termination procedures should provide adequate notice and fair terms. Concerning provisions: automatic renewals without notice, excessive termination penalties, and forfeiture of deposits for early departure. Proper procedures include mutual notice requirements and proportional penalties.', 6, 'lease'),

('lease_comprehensive', 'Utility and service arrangements should clearly specify tenant and landlord responsibilities. Red flags: tenant pays all utilities regardless of control, estimated utility bills, and charges for services not provided. Fair arrangements align payment responsibility with usage control and actual costs.', 7, 'lease'),

('lease_comprehensive', 'Property access and privacy rights must balance landlord needs with tenant privacy. Warning signs: unlimited access rights, no notice requirements, and broad inspection powers. Reasonable access includes 24-48 hour notice, specific purposes, and emergency exceptions only.', 8, 'lease'),

('lease_comprehensive', 'Subletting and assignment policies should be clearly defined and reasonable. Concerning restrictions: absolute prohibition on subletting, unreasonable approval standards, and excessive fees for transfers. Balanced policies allow subletting with landlord approval and reasonable processing fees.', 9, 'lease'),

('lease_comprehensive', 'Property condition and habitability standards ensure livable premises. Red flags: "as-is" rental conditions, tenant responsibility for code violations, and waiver of habitability warranties. Proper leases ensure compliance with housing codes and landlord maintenance of essential services.', 10, 'lease'),

('lease_comprehensive', 'Parking and storage provisions should be clearly specified and fairly allocated. Warning signs: additional fees for previously included parking, no assigned spaces, and liability waivers for vehicle damage. Fair arrangements include clear space assignments and reasonable additional storage options.', 11, 'lease'),

('lease_comprehensive', 'Noise and conduct policies should be reasonable and consistently enforced. Concerning rules: subjective noise standards, excessive quiet hours, and discriminatory enforcement. Balanced policies include objective standards, reasonable hours, and consistent application to all tenants.', 12, 'lease'),

('lease_comprehensive', 'Property modifications and improvements should have clear approval processes. Red flags: prohibition on any changes including removable items, forfeiture of improvements to landlord, and restoration requirements exceeding original condition. Reasonable policies distinguish between permanent and temporary modifications.', 13, 'lease'),

('lease_comprehensive', 'Insurance requirements should be appropriate and clearly explained. Warning signs: excessive coverage amounts, specific carrier requirements, and tenant liability for landlord negligence. Fair insurance provisions include standard renter coverage and clear liability boundaries.', 14, 'lease'),

('lease_comprehensive', 'Dispute resolution and legal procedures should be fair and accessible. Concerning clauses: waiver of jury trial rights, mandatory arbitration for all disputes, and tenant payment of all legal fees. Balanced approaches preserve legal rights while encouraging reasonable dispute resolution.', 15, 'lease'),

-- Employment Contract Examples (15 examples)
('employment_comprehensive', 'Job descriptions and responsibilities should be specific yet flexible enough for business needs. Red flags: unlimited duties "as assigned," no clear reporting structure, and expectations far exceeding the role level. Fair descriptions include core responsibilities, reporting relationships, and reasonable additional duties.', 1, 'employment'),

('employment_comprehensive', 'Compensation structures should be transparent and competitive. Warning signs: below-market base pay with unrealistic bonus targets, commission-only structures without base salary, and discretionary bonuses with no criteria. Fair compensation includes market-rate base pay and clear bonus/commission structures.', 2, 'employment'),

('employment_comprehensive', 'Benefits packages should be clearly described with eligibility requirements. Concerning omissions: no health insurance contribution, immediate benefit forfeiture upon termination, and vague vacation policies. Comprehensive packages include standard benefits with clear accrual and usage policies.', 3, 'employment'),

('employment_comprehensive', 'Non-compete agreements should be reasonable in scope, duration, and geography. Red flags: industry-wide restrictions, indefinite time periods, and global geographic scope. Enforceable non-competes are limited to specific competitors, reasonable time frames (6-24 months), and relevant geographic areas.', 4, 'employment'),

('employment_comprehensive', 'Confidentiality and trade secret protections should be specific and reasonable. Warning signs: overly broad definitions of confidential information, indefinite confidentiality periods, and restrictions on using general skills. Balanced NDAs protect legitimate business interests while preserving employee mobility.', 5, 'employment'),

('employment_comprehensive', 'Intellectual property ownership should distinguish between work-related and personal creations. Concerning clauses: automatic assignment of all inventions, claims to pre-employment IP, and broad work-for-hire definitions. Fair IP terms cover work-related inventions with clear personal project exceptions.', 6, 'employment'),

('employment_comprehensive', 'Termination procedures should specify notice requirements and severance arrangements. Red flags: immediate termination for minor infractions, no severance regardless of tenure, and forfeiture of earned benefits. Reasonable procedures include progressive discipline and proportional severance based on service length.', 7, 'employment'),

('employment_comprehensive', 'Performance evaluation processes should be objective and fair. Warning signs: purely subjective review criteria, no appeal process, and performance improvement plans used as termination setups. Fair systems include measurable goals, regular feedback, and genuine improvement opportunities.', 8, 'employment'),

('employment_comprehensive', 'Work schedule and location arrangements should be clearly defined. Concerning terms: unlimited overtime expectations, no remote work flexibility, and on-call requirements without compensation. Balanced arrangements include reasonable hours, overtime policies, and clear remote work guidelines.', 9, 'employment'),

('employment_comprehensive', 'Professional development and training opportunities should be supported appropriately. Red flags: no training budget, restrictions on external education, and training cost repayment requirements. Supportive employers invest in employee growth with reasonable training policies and development opportunities.', 10, 'employment'),

('employment_comprehensive', 'Expense reimbursement policies should cover legitimate business expenses. Warning signs: no expense reimbursement, employee payment for business tools, and unreasonable documentation requirements. Fair policies reimburse necessary business expenses with reasonable approval and documentation processes.', 11, 'employment'),

('employment_comprehensive', 'Workplace policies should comply with employment laws and promote fair treatment. Concerning gaps: no anti-discrimination policies, unclear harassment procedures, and inadequate accommodation processes. Comprehensive policies address legal requirements and create inclusive work environments.', 12, 'employment'),

('employment_comprehensive', 'Stock options and equity compensation should have clear vesting and exercise terms. Red flags: cliff vesting exceeding one year, forfeiture upon any termination, and exercise restrictions post-employment. Fair equity plans include reasonable vesting schedules and post-termination exercise periods.', 13, 'employment'),

('employment_comprehensive', 'Dispute resolution procedures should be fair and accessible to employees. Warning signs: mandatory arbitration for all claims, employer-selected arbitrators, and employee payment of arbitration costs. Balanced procedures preserve employee rights while providing efficient dispute resolution options.', 14, 'employment'),

('employment_comprehensive', 'Contract modification and amendment procedures should protect both parties. Concerning terms: unilateral modification rights by employer, oral amendment allowances, and automatic updates by policy reference. Secure contracts require written amendments and mutual agreement for significant changes.', 15, 'employment');