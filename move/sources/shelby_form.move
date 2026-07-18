module shelby_form_addr::shelby_form {
    use std::string::{String, utf8};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------
    const EFORM_NOT_FOUND: u64 = 1;
    const ENOT_OWNER: u64 = 2;
    const EFORM_INACTIVE: u64 = 3;

    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------
    struct Form has store, drop {
        id: String,
        owner: address,
        title: String,
        description: String,
        fields_json: String,
        settings_json: String,
        active: bool,
        submission_count: u64,
        created_at: u64,
        updated_at: u64,
    }

    struct Submission has store, drop {
        id: String,
        form_id: String,
        blob_hash: String,
        submitted_at: u64,
        submitter: address,
    }

    struct FormRegistry has key {
        forms: vector<Form>,
        next_id: u64,
    }

    struct SubmissionRegistry has key {
        submissions: vector<Submission>,
        next_id: u64,
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------
    #[event]
    struct FormCreated has drop, store {
        form_id: String,
        owner: address,
        title: String,
        created_at: u64,
    }

    #[event]
    struct SubmissionRecorded has drop, store {
        submission_id: String,
        form_id: String,
        blob_hash: String,
        submitted_at: u64,
    }

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------
    fun init_module(account: &signer) {
        move_to(account, FormRegistry { forms: vector::empty(), next_id: 0 });
        move_to(account, SubmissionRegistry { submissions: vector::empty(), next_id: 0 });
    }

    // -------------------------------------------------------------------------
    // Entry Functions
    // -------------------------------------------------------------------------
    public entry fun create_form(
        account: &signer,
        title: String,
        description: String,
        fields_json: String,
        settings_json: String,
    ) acquires FormRegistry {
        let owner = account::get_signer_address(account);
        let registry = borrow_global_mut<FormRegistry>(owner);
        let id = registry.next_id;
        registry.next_id = id + 1;

        let form_id = utf8(b"form_");
        // Append id as string (simplified: just use numeric id)
        // In production, use proper string formatting
        let now = timestamp::now_seconds();

        let form = Form {
            id: form_id,
            owner,
            title,
            description,
            fields_json,
            settings_json,
            active: true,
            submission_count: 0,
            created_at: now,
            updated_at: now,
        };

        vector::push_back(&mut registry.forms, form);

        event::emit(FormCreated {
            form_id: form.id,
            owner,
            title,
            created_at: now,
        });
    }

    public entry fun submit_form(
        _account: &signer,
        form_id: String,
        blob_hash: String,
        owner: address,
    ) acquires FormRegistry, SubmissionRegistry {
        let form_registry = borrow_global_mut<FormRegistry>(owner);
        let form_opt = find_form_mut(&mut form_registry.forms, &form_id);
        assert!(option::is_some(form_opt), EFORM_NOT_FOUND);

        let form = option::borrow_mut(form_opt);
        assert!(form.active, EFORM_INACTIVE);

        let sub_registry = borrow_global_mut<SubmissionRegistry>(owner);
        let sub_id = sub_registry.next_id;
        sub_registry.next_id = sub_id + 1;

        let now = timestamp::now_seconds();
        let submission_id = utf8(b"sub_");

        let submission = Submission {
            id: submission_id,
            form_id,
            blob_hash,
            submitted_at: now,
            submitter: owner, // anonymous — no wallet required for submitter
        };

        vector::push_back(&mut sub_registry.submissions, submission);
        form.submission_count = form.submission_count + 1;
        form.updated_at = now;

        event::emit(SubmissionRecorded {
            submission_id,
            form_id,
            blob_hash,
            submitted_at: now,
        });
    }

    public entry fun toggle_form_active(
        account: &signer,
        form_id: String,
        active: bool,
    ) acquires FormRegistry {
        let owner = account::get_signer_address(account);
        let registry = borrow_global_mut<FormRegistry>(owner);
        let form_opt = find_form_mut(&mut registry.forms, &form_id);
        assert!(option::is_some(form_opt), EFORM_NOT_FOUND);

        let form = option::borrow_mut(form_opt);
        assert!(form.owner == owner, ENOT_OWNER);

        form.active = active;
        form.updated_at = timestamp::now_seconds();
    }

    // -------------------------------------------------------------------------
    // View Functions
    // -------------------------------------------------------------------------
    #[view]
    public fun get_form(owner: address, form_id: String): Form acquires FormRegistry {
        let registry = borrow_global<FormRegistry>(owner);
        let form_opt = find_form(&registry.forms, &form_id);
        assert!(option::is_some(form_opt), EFORM_NOT_FOUND);
        *option::borrow(form_opt)
    }

    #[view]
    public fun get_submissions(owner: address, form_id: String): vector<Submission> acquires SubmissionRegistry {
        let registry = borrow_global<SubmissionRegistry>(owner);
        let result = vector::empty<Submission>();
        let i = 0;
        let len = vector::length(&registry.submissions);
        while (i < len) {
            let sub = vector::borrow(&registry.submissions, i);
            if (sub.form_id == form_id) {
                vector::push_back(&mut result, *sub);
            };
            i = i + 1;
        };
        result
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    use std::option;
    use std::option::Option;

    fun find_form(forms: &vector<Form>, form_id: &String): Option<Form> {
        let i = 0;
        let len = vector::length(forms);
        while (i < len) {
            let form = vector::borrow(forms, i);
            if (form.id == *form_id) {
                return option::some(*form);
            };
            i = i + 1;
        };
        option::none()
    }

    fun find_form_mut(forms: &mut vector<Form>, form_id: &String): Option<&mut Form> {
        let i = 0;
        let len = vector::length(forms);
        while (i < len) {
            let form = vector::borrow_mut(forms, i);
            if (form.id == *form_id) {
                return option::some(form);
            };
            i = i + 1;
        };
        option::none()
    }
}
