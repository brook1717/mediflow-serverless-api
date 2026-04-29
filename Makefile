.PHONY: test deploy logs fmt validate

## Run unit tests
test:
	@bash scripts/test.sh

## Deploy infrastructure (pass ENV=dev|prod, default: dev)
deploy:
	@bash scripts/deploy.sh $(ENV)

## Tail Lambda logs (pass FN=<function-name>, MINS=<minutes-ago>)
logs:
	@bash scripts/logs.sh $(FN) $(MINS)

## Check Terraform formatting
fmt:
	terraform -chdir=infrastructure/terraform fmt -check -recursive

## Validate Terraform configuration
validate:
	terraform -chdir=infrastructure/terraform init -backend=false
	terraform -chdir=infrastructure/terraform validate
